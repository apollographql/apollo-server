import {
  GraphQLExecutionResult,
  GraphQLRequestContext,
  GraphQLService,
  SchemaChangeCallback,
  Unsubscriber,
  GraphQLServiceEngineConfig,
} from 'apollo-server-core';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { isObjectType, isIntrospectionType, GraphQLSchema } from 'graphql';
import { WithRequired } from 'apollo-env';
import { GraphQLSchemaValidationError } from 'apollo-graphql';
import { composeAndValidate, ServiceDefinition } from '@apollo/federation';
import loglevel, { Logger } from 'loglevel';
import loglevelDebug from 'loglevel-debug';

import { buildQueryPlan, buildOperationContext } from './buildQueryPlan';
import {
  executeQueryPlan,
  ServiceMap,
  defaultFieldResolverWithAliasSupport,
} from './executeQueryPlan';

import { getServiceDefinitionsFromRemoteEndpoint } from './loadServicesFromRemoteEndpoint';
import { getServiceDefinitionsFromStorage } from './loadServicesFromStorage';

import { serializeQueryPlan, QueryPlan } from './QueryPlan';
import { GraphQLDataSource } from './datasources/types';
import { RemoteGraphQLDataSource } from './datasources/RemoteGraphQLDatasource';
import { HeadersInit } from 'node-fetch';

export type ServiceEndpointDefinition = Pick<ServiceDefinition, 'name' | 'url'>;

interface GatewayConfigBase {
  debug?: boolean;
  // TODO: expose the query plan in a more flexible JSON format in the future
  // and remove this config option in favor of `exposeQueryPlan`. Playground
  // should cutover to use the new option when it's built.
  __exposeQueryPlanExperimental?: boolean;
  buildService?: (definition: ServiceEndpointDefinition) => GraphQLDataSource;
}

interface RemoteGatewayConfig extends GatewayConfigBase {
  serviceList: ServiceEndpointDefinition[];
  introspectionHeaders?: HeadersInit;
}

interface ManagedGatewayConfig extends GatewayConfigBase {
  federationVersion?: number;
}
interface LocalGatewayConfig extends GatewayConfigBase {
  localServiceList: ServiceDefinition[];
}

export type GatewayConfig =
  | RemoteGatewayConfig
  | LocalGatewayConfig
  | ManagedGatewayConfig;

function isLocalConfig(config: GatewayConfig): config is LocalGatewayConfig {
  return 'localServiceList' in config;
}

function isRemoteConfig(config: GatewayConfig): config is RemoteGatewayConfig {
  return 'serviceList' in config;
}

function isManagedConfig(
  config: GatewayConfig,
): config is ManagedGatewayConfig {
  return !isRemoteConfig(config) && !isLocalConfig(config);
}

export class ApolloGateway implements GraphQLService {
  public schema?: GraphQLSchema;
  protected serviceMap: ServiceMap = Object.create(null);
  protected config: GatewayConfig;
  protected logger: Logger;
  protected queryPlanStore?: InMemoryLRUCache<QueryPlan>;
  private engineConfig: GraphQLServiceEngineConfig | undefined;
  private pollingTimer?: NodeJS.Timer;
  private onSchemaChangeListeners = new Set<SchemaChangeCallback>();

  constructor(config?: GatewayConfig) {
    this.config = {
      // TODO: expose the query plan in a more flexible JSON format in the future
      // and remove this config option in favor of `exposeQueryPlan`. Playground
      // should cutover to use the new option when it's built.
      __exposeQueryPlanExperimental: process.env.NODE_ENV !== 'production',
      ...config,
    };

    // Setup logging facilities, scoped under the appropriate name.
    this.logger = loglevel.getLogger(`apollo-gateway:`);

    // Support DEBUG environment variable, à la https://npm.im/debug/.
    loglevelDebug(this.logger);

    // And also support the `debug` option, if it's truthy.
    if (this.config.debug === true) {
      this.logger.enableAll();
    }

    if (isLocalConfig(this.config)) {
      this.createSchema(this.config.localServiceList);
    }

    this.initializeQueryPlanStore();
  }

  public async load(options?: { engine?: GraphQLServiceEngineConfig }) {
    if (options) this.engineConfig = options.engine;
    if (this.schema) {
      return { schema: this.schema, executor: this.executor };
    }

    this.logger.debug('Loading configuration for Gateway');
    const [services] = await this.loadServiceDefinitions(this.config);
    this.logger.debug('Configuration loaded for Gateway');
    this.schema = this.createSchema(services);

    return { schema: this.schema, executor: this.executor };
  }

  protected createSchema(services: ServiceDefinition[]) {
    this.logger.debug(
      `Composing schema from service list: \n${services
        .map(({ name, url }) => `  ${url || 'local'}: ${name}`)
        .join('\n')}`,
    );

    const { schema, errors } = composeAndValidate(services);

    if (errors && errors.length > 0) {
      throw new GraphQLSchemaValidationError(errors);
    }

    // this is a temporary workaround for GraphQLFieldExtensions automatic
    // wrapping of all fields when using ApolloServer. Here we wrap all fields
    // with support for resolving aliases as part of the root value which
    // happens because alises are resolved by sub services and the shape
    // of the rootvalue already contains the aliased fields as responseNames
    this.schema = wrapSchemaWithAliasResolver(schema);

    this.createServices(services);

    this.logger.debug('Schema loaded and ready for execution');
    return schema;
  }

  public onSchemaChange(callback: SchemaChangeCallback): Unsubscriber {
    if (!isManagedConfig(this.config)) {
      return () => {};
    }

    this.onSchemaChangeListeners.add(callback);
    if (!this.pollingTimer) this.startPollingServices();

    return () => {
      this.onSchemaChangeListeners.delete(callback);
      if (this.onSchemaChangeListeners.size === 0 && this.pollingTimer) {
        clearInterval(this.pollingTimer!);
        this.pollingTimer = undefined;
      }
    };
  }

  private startPollingServices() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);

    this.pollingTimer = setInterval(async () => {
      let services, isNewSchema;
      try {
        [services, isNewSchema] = await this.loadServiceDefinitions(
          this.config,
        );
      } catch (e) {
        this.logger.debug(
          'Error checking for schema updates. Falling back to existing schema.',
          e,
        );
        return;
      }
      if (!isNewSchema) {
        this.logger.debug('No changes to gateway config');
        return;
      }
      if (this.queryPlanStore) this.queryPlanStore.flush();
      this.logger.debug('Gateway config has changed, updating schema');
      this.createSchema(services);
      try {
        this.onSchemaChangeListeners.forEach(listener =>
          listener(this.schema!),
        );
      } catch (e) {
        this.logger.debug(
          'Error notifying schema change listener of update to schema.',
          e,
        );
      }
    }, 10 * 1000);
  }

  protected createServices(services: ServiceEndpointDefinition[]) {
    for (const serviceDef of services) {
      if (!serviceDef.url && !isLocalConfig(this.config)) {
        throw new Error(
          `Service definition for service ${serviceDef.name} is missing a url`,
        );
      }
      this.serviceMap[serviceDef.name] = this.config.buildService
        ? this.config.buildService(serviceDef)
        : new RemoteGraphQLDataSource({
            url: serviceDef.url,
          });
    }
  }

  protected async loadServiceDefinitions(
    config: GatewayConfig,
  ): Promise<[ServiceDefinition[], boolean]> {
    if (isLocalConfig(config)) {
      return [config.localServiceList, false];
    }

    if (isRemoteConfig(config)) {
      return getServiceDefinitionsFromRemoteEndpoint({
        serviceList: config.serviceList,
        ...(config.introspectionHeaders
          ? { headers: config.introspectionHeaders }
          : {}),
      });
    }

    if (!this.engineConfig) {
      throw new Error(
        'When `serviceList` is not set, an Apollo Engine configuration must be provided. See https://www.apollographql.com/docs/apollo-server/federation/managed-federation/ for more information.',
      );
    }

    return getServiceDefinitionsFromStorage({
      graphId: this.engineConfig.graphId,
      apiKeyHash: this.engineConfig.apiKeyHash,
      graphVariant: this.engineConfig.graphVariant,
      federationVersion: config.federationVersion || 1,
    });
  }

  public executor = async <TContext>(
    requestContext: WithRequired<
      GraphQLRequestContext<TContext>,
      'document' | 'operation' | 'queryHash'
    >,
  ): Promise<GraphQLExecutionResult> => {
    const { request, document, queryHash } = requestContext;
    const operationContext = buildOperationContext(
      this.schema!,
      document,
      request.operationName,
    );
    let queryPlan;
    if (this.queryPlanStore) {
      queryPlan = await this.queryPlanStore.get(queryHash);
    }

    if (!queryPlan) {
      queryPlan = buildQueryPlan(operationContext);
      if (this.queryPlanStore) {
        // The underlying cache store behind the `documentStore` returns a
        // `Promise` which is resolved (or rejected), eventually, based on the
        // success or failure (respectively) of the cache save attempt.  While
        // it's certainly possible to `await` this `Promise`, we don't care about
        // whether or not it's successful at this point.  We'll instead proceed
        // to serve the rest of the request and just hope that this works out.
        // If it doesn't work, the next request will have another opportunity to
        // try again.  Errors will surface as warnings, as appropriate.
        //
        // While it shouldn't normally be necessary to wrap this `Promise` in a
        // `Promise.resolve` invocation, it seems that the underlying cache store
        // is returning a non-native `Promise` (e.g. Bluebird, etc.).
        Promise.resolve(this.queryPlanStore.set(queryHash, queryPlan)).catch(
          err => this.logger.warn('Could not store queryPlan', err),
        );
      }
    }

    const response = await executeQueryPlan<TContext>(
      queryPlan,
      this.serviceMap,
      requestContext,
      operationContext,
    );

    const shouldShowQueryPlan =
      this.config.__exposeQueryPlanExperimental &&
      request.http &&
      request.http.headers &&
      request.http.headers.get('Apollo-Query-Plan-Experimental');

    if (shouldShowQueryPlan) {
      const serializedQueryPlan = serializeQueryPlan(queryPlan);
      this.logger.debug(serializedQueryPlan);

      // TODO: expose the query plan in a more flexible JSON format in the future
      // and rename this to `queryPlan`. Playground should cutover to use the new
      // option once we've built a way to print that representation.
      response.extensions = { __queryPlanExperimental: serializedQueryPlan };
    }
    return response;
  };

  private initializeQueryPlanStore(): void {
    this.queryPlanStore = new InMemoryLRUCache<QueryPlan>({
      // Create ~about~ a 30MiB InMemoryLRUCache.  This is less than precise
      // since the technique to calculate the size of a DocumentNode is
      // only using JSON.stringify on the DocumentNode (and thus doesn't account
      // for unicode characters, etc.), but it should do a reasonable job at
      // providing a caching document store for most operations.
      maxSize: Math.pow(2, 20) * 30,
      sizeCalculator: approximateObjectSize,
    });
  }

  public async stop() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = undefined;
    }
  }
}

function approximateObjectSize<T>(obj: T): number {
  return Buffer.byteLength(JSON.stringify(obj), 'utf8');
}

// We can't use transformSchema here because the extension data for query
// planning would be lost. Instead we set a resolver for each field
// in order to counteract GraphQLExtensions preventing a defaultFieldResolver
// from doing the same job
function wrapSchemaWithAliasResolver(schema: GraphQLSchema): GraphQLSchema {
  const typeMap = schema.getTypeMap();
  Object.keys(typeMap).forEach(typeName => {
    const type = typeMap[typeName];

    if (isObjectType(type) && !isIntrospectionType(type)) {
      const fields = type.getFields();
      Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        field.resolve = defaultFieldResolverWithAliasSupport;
      });
    }
  });
  return schema;
}

export {
  buildQueryPlan,
  executeQueryPlan,
  serializeQueryPlan,
  buildOperationContext,
  QueryPlan,
  ServiceMap,
};
export * from './datasources';
