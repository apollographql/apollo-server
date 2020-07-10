import {
  GraphQLService,
  SchemaChangeCallback,
  Unsubscriber,
  GraphQLServiceEngineConfig,
} from 'apollo-server-core';
import {
  GraphQLExecutionResult,
  Logger,
  GraphQLRequestContextExecutionDidStart,
} from 'apollo-server-types';
import { InMemoryLRUCache } from 'apollo-server-caching';
import {
  isObjectType,
  isIntrospectionType,
  GraphQLSchema,
  GraphQLError,
  VariableDefinitionNode,
} from 'graphql';
import { GraphQLSchemaValidationError } from 'apollo-graphql';
import { composeAndValidate, ServiceDefinition } from '@apollo/federation';
import loglevel from 'loglevel';

import { buildQueryPlan, buildOperationContext } from './buildQueryPlan';
import {
  executeQueryPlan,
  ServiceMap,
  defaultFieldResolverWithAliasSupport,
} from './executeQueryPlan';

import { getServiceDefinitionsFromRemoteEndpoint } from './loadServicesFromRemoteEndpoint';
import {
  getServiceDefinitionsFromStorage,
  CompositionMetadata,
} from './loadServicesFromStorage';

import { serializeQueryPlan, QueryPlan, OperationContext } from './QueryPlan';
import { GraphQLDataSource } from './datasources/types';
import { RemoteGraphQLDataSource } from './datasources/RemoteGraphQLDataSource';
import { HeadersInit } from 'node-fetch';
import { getVariableValues } from 'graphql/execution/values';
import fetcher from 'make-fetch-happen';
import { HttpRequestCache } from './cache';
import { fetch } from 'apollo-server-env';

export type ServiceEndpointDefinition = Pick<ServiceDefinition, 'name' | 'url'>;

interface GatewayConfigBase {
  debug?: boolean;
  logger?: Logger;
  // TODO: expose the query plan in a more flexible JSON format in the future
  // and remove this config option in favor of `exposeQueryPlan`. Playground
  // should cutover to use the new option when it's built.
  __exposeQueryPlanExperimental?: boolean;
  buildService?: (definition: ServiceEndpointDefinition) => GraphQLDataSource;

  // experimental observability callbacks
  experimental_didResolveQueryPlan?: Experimental_DidResolveQueryPlanCallback;
  experimental_didFailComposition?: Experimental_DidFailCompositionCallback;
  experimental_updateServiceDefinitions?: Experimental_UpdateServiceDefinitions;
  experimental_didUpdateComposition?: Experimental_DidUpdateCompositionCallback;
  experimental_pollInterval?: number;
  experimental_approximateQueryPlanStoreMiB?: number;
  experimental_autoFragmentization?: boolean;
  fetcher?: typeof fetch;
  serviceHealthCheck?: boolean;
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

type DataSourceMap = {
  [serviceName: string]: { url?: string; dataSource: GraphQLDataSource };
};

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

export type Experimental_DidResolveQueryPlanCallback = ({
  queryPlan,
  serviceMap,
  operationContext,
  requestContext,
}: {
  readonly queryPlan: QueryPlan;
  readonly serviceMap: ServiceMap;
  readonly operationContext: OperationContext;
  readonly requestContext: GraphQLRequestContextExecutionDidStart<Record<string, any>>;
}) => void;

export type Experimental_DidFailCompositionCallback = ({
  errors,
  serviceList,
  compositionMetadata,
}: {
  readonly errors: GraphQLError[];
  readonly serviceList: ServiceDefinition[];
  readonly compositionMetadata?: CompositionMetadata;
}) => void;

export interface Experimental_CompositionInfo {
  serviceDefinitions: ServiceDefinition[];
  schema: GraphQLSchema;
  compositionMetadata?: CompositionMetadata;
}

export type Experimental_DidUpdateCompositionCallback = (
  currentConfig: Experimental_CompositionInfo,
  previousConfig?: Experimental_CompositionInfo,
) => void;

/**
 * **Note:** It's possible for a schema to be the same (`isNewSchema: false`) when
 * `serviceDefinitions` have changed. For example, during type migration, the
 * composed schema may be identical but the `serviceDefinitions` would differ
 * since a type has moved from one service to another.
 */
export type Experimental_UpdateServiceDefinitions = (
  config: GatewayConfig,
) => Promise<{
  serviceDefinitions?: ServiceDefinition[];
  compositionMetadata?: CompositionMetadata;
  isNewSchema: boolean;
}>;

type Await<T> = T extends Promise<infer U> ? U : T;

// Local state to track whether particular UX-improving warning messages have
// already been emitted.  This is particularly useful to prevent recurring
// warnings of the same type in, e.g. repeating timers, which don't provide
// additional value when they are repeated over and over during the life-time
// of a server.
type WarnedStates = {
  remoteWithLocalConfig?: boolean;
};

export const GCS_RETRY_COUNT = 5;

export function getDefaultGcsFetcher() {
  return fetcher.defaults({
    cacheManager: new HttpRequestCache(),
    // All headers should be lower-cased here, as `make-fetch-happen`
    // treats differently cased headers as unique (unlike the `Headers` object).
    // @see: https://git.io/JvRUa
    headers: {
      'user-agent': `apollo-gateway/${require('../package.json').version}`,
    },
    retry: {
      retries: GCS_RETRY_COUNT,
      // The default factor: expected attempts at 0, 1, 3, 7, 15, and 31 seconds elapsed
      factor: 2,
      // 1 second
      minTimeout: 1000,
      randomize: true,
    },
  });
}

export const HEALTH_CHECK_QUERY =
  'query __ApolloServiceHealthCheck__ { __typename }';
export const SERVICE_DEFINITION_QUERY =
  'query __ApolloGetServiceDefinition__ { _service { sdl } }';

export class ApolloGateway implements GraphQLService {
  public schema?: GraphQLSchema;
  protected serviceMap: DataSourceMap = Object.create(null);
  protected config: GatewayConfig;
  private logger: Logger;
  protected queryPlanStore?: InMemoryLRUCache<QueryPlan>;
  private engineConfig: GraphQLServiceEngineConfig | undefined;
  private pollingTimer?: NodeJS.Timer;
  private onSchemaChangeListeners = new Set<SchemaChangeCallback>();
  private serviceDefinitions: ServiceDefinition[] = [];
  private compositionMetadata?: CompositionMetadata;
  private serviceSdlCache = new Map<string, string>();
  private warnedStates: WarnedStates = Object.create(null);

  private fetcher: typeof fetch = getDefaultGcsFetcher();

  // Observe query plan, service info, and operation info prior to execution.
  // The information made available here will give insight into the resulting
  // query plan and the inputs that generated it.
  protected experimental_didResolveQueryPlan?: Experimental_DidResolveQueryPlanCallback;
  // Observe composition failures and the ServiceList that caused them. This
  // enables reporting any issues that occur during composition. Implementors
  // will be interested in addressing these immediately.
  protected experimental_didFailComposition?: Experimental_DidFailCompositionCallback;
  // Used to communicated composition changes, and what definitions caused
  // those updates
  protected experimental_didUpdateComposition?: Experimental_DidUpdateCompositionCallback;
  // Used for overriding the default service list fetcher. This should return
  // an array of ServiceDefinition. *This function must be awaited.*
  protected updateServiceDefinitions: Experimental_UpdateServiceDefinitions;
  // how often service defs should be loaded/updated (in ms)
  protected experimental_pollInterval?: number;

  private experimental_approximateQueryPlanStoreMiB?: number;

  constructor(config?: GatewayConfig) {
    this.config = {
      // TODO: expose the query plan in a more flexible JSON format in the future
      // and remove this config option in favor of `exposeQueryPlan`. Playground
      // should cutover to use the new option when it's built.
      __exposeQueryPlanExperimental: process.env.NODE_ENV !== 'production',
      ...config,
    };

    // Setup logging facilities
    if (this.config.logger) {
      this.logger = this.config.logger;
    } else {
      // If the user didn't provide their own logger, we'll initialize one.
      const loglevelLogger = loglevel.getLogger(`apollo-gateway`);

      // And also support the `debug` option, if it's truthy.
      if (this.config.debug === true) {
        loglevelLogger.setLevel(loglevelLogger.levels.DEBUG);
      } else {
        loglevelLogger.setLevel(loglevelLogger.levels.WARN);
      }

      this.logger = loglevelLogger;
    }

    if (isLocalConfig(this.config)) {
      this.schema = this.createSchema(this.config.localServiceList);
    }

    this.initializeQueryPlanStore();

    // this will be overwritten if the config provides experimental_updateServiceDefinitions
    this.updateServiceDefinitions = this.loadServiceDefinitions;

    if (config) {
      this.updateServiceDefinitions =
        config.experimental_updateServiceDefinitions ||
        this.updateServiceDefinitions;
      // set up experimental observability callbacks
      this.experimental_didResolveQueryPlan =
        config.experimental_didResolveQueryPlan;
      this.experimental_didFailComposition =
        config.experimental_didFailComposition;
      this.experimental_didUpdateComposition =
        config.experimental_didUpdateComposition;

      this.experimental_approximateQueryPlanStoreMiB =
        config.experimental_approximateQueryPlanStoreMiB;

      if (
        isManagedConfig(config) &&
        config.experimental_pollInterval &&
        config.experimental_pollInterval < 10000
      ) {
        this.experimental_pollInterval = 10000;
        this.logger.warn(
          'Polling Apollo services at a frequency of less than once per 10 seconds (10000) is disallowed. Instead, the minimum allowed pollInterval of 10000 will be used. Please reconfigure your experimental_pollInterval accordingly. If this is problematic for your team, please contact support.',
        );
      } else {
        this.experimental_pollInterval = config.experimental_pollInterval;
      }

      // Warn against using the pollInterval and a serviceList simultaneously
      if (config.experimental_pollInterval && isRemoteConfig(config)) {
        this.logger.warn(
          'Polling running services is dangerous and not recommended in production. ' +
            'Polling should only be used against a registry. ' +
            'If you are polling running services, use with caution.',
        );
      }

      if (config.fetcher) {
        this.fetcher = config.fetcher;
      }
    }
  }

  public async load(options?: { engine?: GraphQLServiceEngineConfig }) {
    if (options && options.engine) {
      if (!options.engine.graphVariant)
        this.logger.warn('No graph variant provided. Defaulting to `current`.');
      this.engineConfig = options.engine;
    }

    await this.updateComposition();
    if (
      (isManagedConfig(this.config) || this.experimental_pollInterval) &&
      !this.pollingTimer
    ) {
      this.pollServices();
    }

    const { graphId, graphVariant } = (options && options.engine) || {};
    const mode = isManagedConfig(this.config) ? 'managed' : 'unmanaged';

    this.logger.info(
      `Gateway successfully loaded schema.\n\t* Mode: ${mode}${
        graphId ? `\n\t* Service: ${graphId}@${graphVariant || 'current'}` : ''
      }`,
    );

    return {
      // we know this will be here since we're awaiting this.updateComposition
      // before here which sets this.schema
      schema: this.schema!,
      executor: this.executor,
    };
  }

  protected async updateComposition(): Promise<void> {
    let result: Await<ReturnType<Experimental_UpdateServiceDefinitions>>;
    this.logger.debug('Checking service definitions...');
    try {
      result = await this.updateServiceDefinitions(this.config);
    } catch (e) {
      this.logger.error(
        "Error checking for changes to service definitions: " +
         (e && e.message || e)
      );
      throw e;
    }

    if (
      !result.serviceDefinitions ||
      JSON.stringify(this.serviceDefinitions) ===
        JSON.stringify(result.serviceDefinitions)
    ) {
      this.logger.debug('No change in service definitions since last check.');
      return;
    }

    const previousSchema = this.schema;
    const previousServiceDefinitions = this.serviceDefinitions;
    const previousCompositionMetadata = this.compositionMetadata;

    if (previousSchema) {
      this.logger.info("New service definitions were found.");
    }

    // Run service health checks before we commit and update the new schema.
    // This is the last chance to bail out of a schema update.
    if (this.config.serviceHealthCheck) {
      // Here we need to construct new datasources based on the new schema info
      // so we can check the health of the services we're _updating to_.
      const serviceMap = result.serviceDefinitions.reduce(
        (serviceMap, serviceDef) => {
          serviceMap[serviceDef.name] = {
            url: serviceDef.url,
            dataSource: this.createDataSource(serviceDef),
          };
          return serviceMap;
        },
        Object.create(null) as DataSourceMap,
      );

      try {
        await this.serviceHealthCheck(serviceMap);
      } catch (e) {
        this.logger.error(
          'The gateway did not update its schema due to failed service health checks.  ' +
          'The gateway will continue to operate with the previous schema and reattempt updates.' + e
        );
        throw e;
      }
    }

    this.compositionMetadata = result.compositionMetadata;
    this.serviceDefinitions = result.serviceDefinitions;

    if (this.queryPlanStore) this.queryPlanStore.flush();

    this.schema = this.createSchema(result.serviceDefinitions);

    // Notify the schema listeners of the updated schema
    try {
      this.onSchemaChangeListeners.forEach(listener => listener(this.schema!));
    } catch (e) {
      this.logger.error(
        "An error was thrown from an 'onSchemaChange' listener. " +
        "The schema will still update: " + (e && e.message || e));
    }

    if (this.experimental_didUpdateComposition) {
      this.experimental_didUpdateComposition(
        {
          serviceDefinitions: result.serviceDefinitions,
          schema: this.schema,
          ...(this.compositionMetadata && {
            compositionMetadata: this.compositionMetadata,
          }),
        },
        previousServiceDefinitions &&
          previousSchema && {
            serviceDefinitions: previousServiceDefinitions,
            schema: previousSchema,
            ...(previousCompositionMetadata && {
              compositionMetadata: previousCompositionMetadata,
            }),
          },
      );
    }
  }

  /**
   * This can be used without an argument in order to perform an ad-hoc health check
   * of the downstream services like so:
   *
   * @example
   * ```
   * try {
   *   await gateway.serviceHealthCheck();
   * } catch(e) {
   *   /* your error handling here *\/
   * }
   * ```
   * @throws
   * @param serviceMap {DataSourceMap}
   */
  public serviceHealthCheck(serviceMap: DataSourceMap = this.serviceMap) {
    return Promise.all(
      Object.entries(serviceMap).map(([name, { dataSource }]) =>
        dataSource
          .process({ request: { query: HEALTH_CHECK_QUERY }, context: {} })
          .then(response => ({ name, response })),
      ),
    );
  }

  protected createSchema(serviceList: ServiceDefinition[]) {
    this.logger.debug(
      `Composing schema from service list: \n${serviceList
        .map(({ name, url }) => `  ${url || 'local'}: ${name}`)
        .join('\n')}`,
    );

    const { schema, errors } = composeAndValidate(serviceList);

    if (errors && errors.length > 0) {
      if (this.experimental_didFailComposition) {
        this.experimental_didFailComposition({
          errors,
          serviceList,
          ...(this.compositionMetadata && {
            compositionMetadata: this.compositionMetadata,
          }),
        });
      }
      throw new GraphQLSchemaValidationError(errors);
    }

    this.createServices(serviceList);

    this.logger.debug('Schema loaded and ready for execution');

    // FIXME: The comment below may change when `graphql-extensions` is
    // removed, as it will be soon.  It's not clear if this will be temporary,
    // as is suggested, after that time, because we still very much need to
    // do this special alias resolving.  Original comment:
    // this is a temporary workaround for GraphQLFieldExtensions automatic
    // wrapping of all fields when using ApolloServer. Here we wrap all fields
    // with support for resolving aliases as part of the root value which
    // happens because aliases are resolved by sub services and the shape
    // of the root value already contains the aliased fields as responseNames
    return wrapSchemaWithAliasResolver(schema);
  }

  public onSchemaChange(callback: SchemaChangeCallback): Unsubscriber {
    this.onSchemaChangeListeners.add(callback);

    return () => {
      this.onSchemaChangeListeners.delete(callback);
    };
  }

  private async pollServices() {
    if (this.pollingTimer) clearTimeout(this.pollingTimer);

    // Sleep for the specified pollInterval before kicking off another round of polling
    await new Promise(res => {
      this.pollingTimer = setTimeout(
        () => res(),
        this.experimental_pollInterval || 10000,
      );
      // Prevent the Node.js event loop from remaining active (and preventing,
      // e.g. process shutdown) by calling `unref` on the `Timeout`.  For more
      // information, see https://nodejs.org/api/timers.html#timers_timeout_unref.
      this.pollingTimer?.unref();
    });

    try {
      await this.updateComposition();
    } catch (err) {
      this.logger.error(err && err.message || err);
    }

    this.pollServices();
  }

  private createAndCacheDataSource(
    serviceDef: ServiceEndpointDefinition,
  ): GraphQLDataSource {
    // If the DataSource has already been created, early return
    if (
      this.serviceMap[serviceDef.name] &&
      serviceDef.url === this.serviceMap[serviceDef.name].url
    )
      return this.serviceMap[serviceDef.name].dataSource;

    const dataSource = this.createDataSource(serviceDef);

    // Cache the created DataSource
    this.serviceMap[serviceDef.name] = { url: serviceDef.url, dataSource };

    return dataSource;
  }

  private createDataSource(
    serviceDef: ServiceEndpointDefinition,
  ): GraphQLDataSource {
    if (!serviceDef.url && !isLocalConfig(this.config)) {
      this.logger.error(
        `Service definition for service ${serviceDef.name} is missing a url`,
      );
    }

    return this.config.buildService
      ? this.config.buildService(serviceDef)
      : new RemoteGraphQLDataSource({
          url: serviceDef.url,
        });
  }

  protected createServices(services: ServiceEndpointDefinition[]) {
    for (const serviceDef of services) {
      this.createAndCacheDataSource(serviceDef);
    }
  }

  protected async loadServiceDefinitions(
    config: GatewayConfig,
  ): ReturnType<Experimental_UpdateServiceDefinitions> {
    // This helper avoids the repetition of options in the two cases this method
    // is invoked below. It is a helper, rather than an options object, since it
    // depends on the presence of `this.engineConfig`, which is guarded against
    // further down in this method in two separate places.
    const getManagedConfig = (engineConfig: GraphQLServiceEngineConfig) => {
      return getServiceDefinitionsFromStorage({
        graphId: engineConfig.graphId,
        apiKeyHash: engineConfig.apiKeyHash,
        graphVariant: engineConfig.graphVariant,
        federationVersion:
          (config as ManagedGatewayConfig).federationVersion || 1,
        fetcher: this.fetcher,
      });
    };

    if (isLocalConfig(config) || isRemoteConfig(config)) {
      if (this.engineConfig && !this.warnedStates.remoteWithLocalConfig) {
        // Only display this warning once per start-up.
        this.warnedStates.remoteWithLocalConfig = true;
        // This error helps avoid common misconfiguration.
        // We don't await this because a local configuration should assume
        // remote is unavailable for one reason or another.
        getManagedConfig(this.engineConfig).then(() => {
          this.logger.warn(
            "A local gateway service list is overriding an Apollo Graph " +
            "Manager managed configuration.  To use the managed " +
            "configuration, do not specify a service list locally.",
          );
        }).catch(() => {}); // Don't mind errors if managed config is missing.
      }
    }

    if (isLocalConfig(config)) {
      return { isNewSchema: false };
    }

    if (isRemoteConfig(config)) {
      const serviceList = config.serviceList.map(serviceDefinition => ({
        ...serviceDefinition,
        dataSource: this.createAndCacheDataSource(serviceDefinition),
      }));

      return getServiceDefinitionsFromRemoteEndpoint({
        serviceList,
        ...(config.introspectionHeaders
          ? { headers: config.introspectionHeaders }
          : {}),
        serviceSdlCache: this.serviceSdlCache,
      });
    }

    if (!this.engineConfig) {
      throw new Error(
        'When `serviceList` is not set, an Apollo Engine configuration must be provided. See https://www.apollographql.com/docs/apollo-server/federation/managed-federation/ for more information.',
      );
    }

    return getManagedConfig(this.engineConfig);
  }

  // XXX Nothing guarantees that the only errors thrown or returned in
  // result.errors are GraphQLErrors, even though other code (eg
  // apollo-engine-reporting) assumes that. In fact, errors talking to backends
  // are unlikely to show up as GraphQLErrors. Do we need to use
  // formatApolloErrors or something?
  public executor = async <TContext>(
    requestContext: GraphQLRequestContextExecutionDidStart<TContext>,
  ): Promise<GraphQLExecutionResult> => {
    const { request, document, queryHash } = requestContext;
    const queryPlanStoreKey = queryHash + (request.operationName || '');
    const operationContext = buildOperationContext(
      this.schema!,
      document,
      request.operationName,
    );

    // No need to build a query plan if we know the request is invalid beforehand
    // In the future, this should be controlled by the requestPipeline
    const validationErrors = this.validateIncomingRequest(
      requestContext,
      operationContext,
    );

    if (validationErrors.length > 0) {
      return { errors: validationErrors };
    }

    let queryPlan: QueryPlan | undefined;
    if (this.queryPlanStore) {
      queryPlan = await this.queryPlanStore.get(queryPlanStoreKey);
    }

    if (!queryPlan) {
      queryPlan = buildQueryPlan(operationContext, {
        autoFragmentization: Boolean(
          this.config.experimental_autoFragmentization,
        ),
      });
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
        Promise.resolve(
          this.queryPlanStore.set(queryPlanStoreKey, queryPlan),
        ).catch(err =>
          this.logger.warn(
            'Could not store queryPlan' + ((err && err.message) || err),
          ),
        );
      }
    }

    const serviceMap: ServiceMap = Object.entries(this.serviceMap).reduce(
      (serviceDataSources, [serviceName, { dataSource }]) => {
        serviceDataSources[serviceName] = dataSource;
        return serviceDataSources;
      },
      Object.create(null) as ServiceMap,
    );

    if (this.experimental_didResolveQueryPlan) {
      this.experimental_didResolveQueryPlan({
        queryPlan,
        serviceMap,
        requestContext,
        operationContext,
      });
    }

    const response = await executeQueryPlan<TContext>(
      queryPlan,
      serviceMap,
      requestContext,
      operationContext,
    );

    const shouldShowQueryPlan =
      this.config.__exposeQueryPlanExperimental &&
      request.http &&
      request.http.headers &&
      request.http.headers.get('Apollo-Query-Plan-Experimental');

    // We only want to serialize the query plan if we're going to use it, which is
    // in two cases:
    // 1) non-empty query plan and config.debug === true
    // 2) non-empty query plan and shouldShowQueryPlan === true
    const serializedQueryPlan =
      queryPlan.node && (this.config.debug || shouldShowQueryPlan)
        ? serializeQueryPlan(queryPlan)
        : null;

    if (this.config.debug && serializedQueryPlan) {
      this.logger.debug(serializedQueryPlan);
    }

    if (shouldShowQueryPlan) {
      // TODO: expose the query plan in a more flexible JSON format in the future
      // and rename this to `queryPlan`. Playground should cutover to use the new
      // option once we've built a way to print that representation.

      // In the case that `serializedQueryPlan` is null (on introspection), we
      // still want to respond to Playground with something truthy since it depends
      // on this to decide that query plans are supported by this gateway.
      response.extensions = {
        __queryPlanExperimental: serializedQueryPlan || true,
      };
    }
    return response;
  };

  protected validateIncomingRequest<TContext>(
    requestContext: GraphQLRequestContextExecutionDidStart<TContext>,
    operationContext: OperationContext,
  ) {
    // casting out of `readonly`
    const variableDefinitions = operationContext.operation
      .variableDefinitions as VariableDefinitionNode[] | undefined;

    if (!variableDefinitions) return [];

    const { errors } = getVariableValues(
      operationContext.schema,
      variableDefinitions,
      requestContext.request.variables!,
    );

    return errors || [];
  }

  private initializeQueryPlanStore(): void {
    this.queryPlanStore = new InMemoryLRUCache<QueryPlan>({
      // Create ~about~ a 30MiB InMemoryLRUCache.  This is less than precise
      // since the technique to calculate the size of a DocumentNode is
      // only using JSON.stringify on the DocumentNode (and thus doesn't account
      // for unicode characters, etc.), but it should do a reasonable job at
      // providing a caching document store for most operations.
      maxSize:
        Math.pow(2, 20) *
        (this.experimental_approximateQueryPlanStoreMiB || 30),
      sizeCalculator: approximateObjectSize,
    });
  }

  public async stop() {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
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
