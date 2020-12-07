import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} from 'graphql-tools';
import loglevel from 'loglevel';
import {
  GraphQLSchema,
  GraphQLError,
  GraphQLFieldResolver,
  ValidationContext,
  FieldDefinitionNode,
  DocumentNode,
  isObjectType,
  isScalarType,
  isSchema,
  ParseOptions,
} from 'graphql';
import {
  InMemoryLRUCache,
  PrefixingKeyValueCache,
} from 'apollo-server-caching';
import {
  ApolloServerPlugin,
  GraphQLServiceContext,
  GraphQLServerListener,
} from 'apollo-server-plugin-base';

import {
  GraphQLServerOptions,
  PersistedQueryOptions,
} from './graphqlOptions';

import {
  Config,
  Context,
  ContextFunction,
  PluginDefinition,
} from './types';

import { gql } from './index';

import {
  createPlaygroundOptions,
  PlaygroundRenderPageOptions,
} from './playground';

import { generateSchemaHash } from './utils/schemaHash';
import { isDirectiveDefined } from './utils/isDirectiveDefined';
import {
  processGraphQLRequest,
  GraphQLRequestContext,
  GraphQLRequest,
  APQ_CACHE_PREFIX,
} from './requestPipeline';

import { Headers } from 'apollo-server-env';
import { buildServiceDefinition } from '@apollographql/apollo-tools';
import { plugin as pluginTracing } from "apollo-tracing";
import { Logger, SchemaHash, ValueOrPromise, ApolloConfig } from "apollo-server-types";
import {
  plugin as pluginCacheControl,
  CacheControlExtensionOptions,
} from 'apollo-cache-control';
import { cloneObject } from "./runHttpQuery";
import isNodeLike from './utils/isNodeLike';
import { determineApolloConfig } from './determineApolloConfig';
import {
  ApolloServerPluginSchemaReporting,
  ApolloServerPluginSchemaReportingOptions,
  ApolloServerPluginInlineTrace,
  ApolloServerPluginUsageReporting,
} from './plugin';
import { InternalPluginId, pluginIsInternal } from './plugin/internalPlugin';

const NoIntrospection = (context: ValidationContext) => ({
  Field(node: FieldDefinitionNode) {
    if (node.name.value === '__schema' || node.name.value === '__type') {
      context.reportError(
        new GraphQLError(
          'GraphQL introspection is not allowed by Apollo Server, but the query contained __schema or __type. To enable introspection, pass introspection: true to ApolloServer in production',
          [node],
        ),
      );
    }
  },
});

function approximateObjectSize<T>(obj: T): number {
  return Buffer.byteLength(JSON.stringify(obj), 'utf8');
}

type SchemaDerivedData = {
  // A store that, when enabled (default), will store the parsed and validated
  // versions of operations in-memory, allowing subsequent parses/validates
  // on the same operation to be executed immediately.
  documentStore?: InMemoryLRUCache<DocumentNode>;
  schema: GraphQLSchema;
  schemaHash: SchemaHash;
};

export class ApolloServerBase {
  private logger: Logger;
  public graphqlPath: string = '/graphql';
  public requestOptions: Partial<GraphQLServerOptions<any>> = Object.create(null);

  private context?: Context | ContextFunction;
  private apolloConfig: ApolloConfig;
  protected plugins: ApolloServerPlugin[] = [];

  // the default version is specified in playground.ts
  protected playgroundOptions?: PlaygroundRenderPageOptions;

  private parseOptions: ParseOptions;
  private schemaDerivedData: Promise<SchemaDerivedData>;
  private config: Config;
  /** @deprecated: This is undefined for servers operating as gateways, and will be removed in a future release **/
  protected schema?: GraphQLSchema;
  private toDispose = new Set<() => ValueOrPromise<void>>();
  private experimental_approximateDocumentStoreMiB:
    Config['experimental_approximateDocumentStoreMiB'];

  // The constructor should be universal across all environments. All environment specific behavior should be set by adding or overriding methods
  constructor(config: Config) {
    if (!config) throw new Error('ApolloServer requires options.');
    this.config = config;
    const {
      context,
      resolvers,
      schema,
      schemaDirectives,
      modules,
      typeDefs,
      parseOptions = {},
      introspection,
      mocks,
      mockEntireSchema,
      playground,
      plugins,
      gateway,
      cacheControl,
      experimental_approximateDocumentStoreMiB,
      stopOnTerminationSignals,
      apollo,
      ...requestOptions
    } = config;

    // Setup logging facilities
    if (config.logger) {
      this.logger = config.logger;
    } else {
      // If the user didn't provide their own logger, we'll initialize one.
      const loglevelLogger = loglevel.getLogger("apollo-server");

      // We don't do much logging in Apollo Server right now.  There's a notion
      // of a `debug` flag, which changes stack traces in some error messages,
      // and adds a bit of debug logging to some plugins. `info` is primarily
      // used for startup logging in plugins. We'll default to `info` so you
      // get to see that startup logging.
      if (this.config.debug === true) {
        loglevelLogger.setLevel(loglevel.levels.DEBUG);
      } else {
        loglevelLogger.setLevel(loglevel.levels.INFO);
      }

      this.logger = loglevelLogger;
    }

    this.apolloConfig = determineApolloConfig(apollo, this.logger);

    if (gateway && (modules || schema || typeDefs || resolvers)) {
      throw new Error(
        'Cannot define both `gateway` and any of: `modules`, `schema`, `typeDefs`, or `resolvers`',
      );
    }

    this.parseOptions = parseOptions;
    this.context = context;

    // While reading process.env is slow, a server should only be constructed
    // once per run, so we place the env check inside the constructor. If env
    // should be used outside of the constructor context, place it as a private
    // or protected field of the class instead of a global. Keeping the read in
    // the constructor enables testing of different environments
    const isDev = process.env.NODE_ENV !== 'production';

    // if this is local dev, introspection should turned on
    // in production, we can manually turn introspection on by passing {
    // introspection: true } to the constructor of ApolloServer
    if (
      (typeof introspection === 'boolean' && !introspection) ||
      (introspection === undefined && !isDev)
    ) {
      const noIntro = [NoIntrospection];
      requestOptions.validationRules = requestOptions.validationRules
        ? requestOptions.validationRules.concat(noIntro)
        : noIntro;
    }

    if (!requestOptions.cache) {
      requestOptions.cache = new InMemoryLRUCache();
    }

    if (requestOptions.persistedQueries !== false) {
      const {
        cache: apqCache = requestOptions.cache!,
        ...apqOtherOptions
      } = requestOptions.persistedQueries || Object.create(null);

      requestOptions.persistedQueries = {
        cache: new PrefixingKeyValueCache(apqCache, APQ_CACHE_PREFIX),
        ...apqOtherOptions,
      };
    } else {
      // the user does not want to use persisted queries, so we remove the field
      delete requestOptions.persistedQueries;
    }

    this.requestOptions = requestOptions as GraphQLServerOptions;

    this.playgroundOptions = createPlaygroundOptions(playground);

    // TODO: This is a bit nasty because the subscription server needs this.schema synchronously, for reasons of backwards compatibility.
    const _schema = this.initSchema();

    if (isSchema(_schema)) {
      const derivedData = this.generateSchemaDerivedData(_schema);
      this.schema = derivedData.schema;
      this.schemaDerivedData = Promise.resolve(derivedData);
    } else if (typeof _schema.then === 'function') {
      this.schemaDerivedData = _schema.then(schema =>
        this.generateSchemaDerivedData(schema),
      );
    } else {
      throw new Error("Unexpected error: Unable to resolve a valid GraphQLSchema.  Please file an issue with a reproduction of this error, if possible.");
    }

    // Plugins will be instantiated if they aren't already, and this.plugins
    // is populated accordingly.
    this.ensurePluginInstantiation(plugins);

    // We handle signals if it was explicitly requested, or if we're in Node,
    // not in a test, and it wasn't explicitly turned off. (For backwards
    // compatibility, we check both 'stopOnTerminationSignals' and
    // 'engine.handleSignals'.)
    if (
      typeof stopOnTerminationSignals === 'boolean'
        ? stopOnTerminationSignals
        : isNodeLike && process.env.NODE_ENV !== 'test'
    ) {
      const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
      signals.forEach((signal) => {
        // Note: Node only started sending signal names to signal events with
        // Node v10 so we can't use that feature here.
        const handler: NodeJS.SignalsListener = async () => {
          await this.stop();
          process.kill(process.pid, signal);
        };
        process.once(signal, handler);
        this.toDispose.add(() => {
          process.removeListener(signal, handler);
        });
      });
    }
  }

  // used by integrations to synchronize the path with subscriptions, some
  // integrations do not have paths, such as lambda
  public setGraphQLPath(path: string) {
    this.graphqlPath = path;
  }

  private initSchema(): GraphQLSchema | Promise<GraphQLSchema> {
    const {
      gateway,
      schema,
      modules,
      typeDefs,
      resolvers,
      schemaDirectives,
      parseOptions,
    } = this.config;
    if (gateway) {
      this.toDispose.add(
        // Store the unsubscribe handles, which are returned from
        // `onSchemaChange`, for later disposal when the server stops
        gateway.onSchemaChange(
          schema =>
            (this.schemaDerivedData = Promise.resolve(
              this.generateSchemaDerivedData(schema),
            )),
        ),
      );

      // Set the executor whether the gateway 'load' call succeeds or not.
      // If the schema becomes available eventually (after a setInterval retry)
      // this executor will still be necessary in order to be able to support
      // a federated schema!
      this.requestOptions.executor = gateway.executor;

      return gateway.load({ apollo: this.apolloConfig })
        .then(config => config.schema)
        .catch(err => {
          // We intentionally do not re-throw the exact error from the gateway
          // configuration as it may contain implementation details and this
          // error will propagate to the client. We will, however, log the error
          // for observation in the logs.
          const message = "This data graph is missing a valid configuration.";
          this.logger.error(message + " " + (err && err.message || err));
          throw new Error(
            message + " More details may be available in the server logs.");
        });
    }

    let constructedSchema: GraphQLSchema;
    if (schema) {
      constructedSchema = schema;
    } else if (modules) {
      const { schema, errors } = buildServiceDefinition(modules);
      if (errors && errors.length > 0) {
        throw new Error(errors.map(error => error.message).join('\n\n'));
      }
      constructedSchema = schema!;
    } else {
      if (!typeDefs) {
        throw Error(
          'Apollo Server requires either an existing schema, modules or typeDefs',
        );
      }

      const augmentedTypeDefs = Array.isArray(typeDefs) ? typeDefs : [typeDefs];

      // We augment the typeDefs with the @cacheControl directive and associated
      // scope enum, so makeExecutableSchema won't fail SDL validation

      if (!isDirectiveDefined(augmentedTypeDefs, 'cacheControl')) {
        augmentedTypeDefs.push(
          gql`
            enum CacheControlScope {
              PUBLIC
              PRIVATE
            }

            directive @cacheControl(
              maxAge: Int
              scope: CacheControlScope
            ) on FIELD_DEFINITION | OBJECT | INTERFACE
          `,
        );
      }

      constructedSchema = makeExecutableSchema({
        typeDefs: augmentedTypeDefs,
        schemaDirectives,
        resolvers,
        parseOptions,
      });
    }

    return constructedSchema;
  }

  private generateSchemaDerivedData(schema: GraphQLSchema): SchemaDerivedData {
    const schemaHash = generateSchemaHash(schema!);

    const { mocks, mockEntireSchema } = this.config;

    if (mocks || (typeof mockEntireSchema !== 'undefined' && mocks !== false)) {
      addMockFunctionsToSchema({
        schema,
        mocks:
          typeof mocks === 'boolean' || typeof mocks === 'undefined'
            ? {}
            : mocks,
        preserveResolvers:
          typeof mockEntireSchema === 'undefined' ? false : !mockEntireSchema,
      });
    }

    // Initialize the document store.  This cannot currently be disabled.
    const documentStore = this.initializeDocumentStore();

    return {
      schema,
      schemaHash,
      documentStore,
    };
  }

  protected serverlessFramework(): boolean {
    return false;
  }

  protected async willStart() {
    try {
      var { schema, schemaHash } = await this.schemaDerivedData;
    } catch (err) {
      // The `schemaDerivedData` can throw if the Promise it points to does not
      // resolve with a `GraphQLSchema`. As errors from `willStart` are start-up
      // errors, other Apollo middleware after us will not be called, including
      // our health check, CORS, etc.
      //
      // Returning here allows the integration's other Apollo middleware to
      // function properly in the event of a failure to obtain the data graph
      // configuration from the gateway's `load` method during initialization.
      return;
    }

    const service: GraphQLServiceContext = {
      logger: this.logger,
      schema: schema,
      schemaHash: schemaHash,
      apollo: this.apolloConfig,
      serverlessFramework: this.serverlessFramework(),
    };

    // The `persistedQueries` attribute on the GraphQLServiceContext was
    // originally used by the operation registry, which shared the cache with
    // it.  This is no longer the case.  However, while we are continuing to
    // expand the support of the interface for `persistedQueries`, e.g. with
    // additions like https://github.com/apollographql/apollo-server/pull/3623,
    // we don't want to continually expand the API surface of what we expose
    // to the plugin API.   In this particular case, it certainly doesn't need
    // to get the `ttl` default value which are intended for APQ only.
    if (this.requestOptions.persistedQueries?.cache) {
      service.persistedQueries = {
        cache: this.requestOptions.persistedQueries.cache,
      };
    }

    const serverListeners = (
      await Promise.all(
        this.plugins.map(
          (plugin) => plugin.serverWillStart && plugin.serverWillStart(service),
        ),
      )
    ).filter(
      (maybeServerListener): maybeServerListener is GraphQLServerListener =>
        typeof maybeServerListener === 'object' &&
        !!maybeServerListener.serverWillStop,
    );
    this.toDispose.add(async () => {
      await Promise.all(
        serverListeners.map(({ serverWillStop }) => serverWillStop?.()),
      );
    });
  }

  public async stop() {
    await Promise.all([...this.toDispose].map(dispose => dispose()));
  }

  // Returns true if it appears that the schema was returned from
  // @apollo/federation's buildFederatedSchema. This strategy avoids depending
  // explicitly on @apollo/federation or relying on something that might not
  // survive transformations like monkey-patching a boolean field onto the
  // schema.
  //
  // This is used for two things:
  // 1) Determining whether traces should be added to responses if requested
  //    with an HTTP header. If you want to include these traces even for
  //    non-federated schemas (when requested via header) you can use
  //    ApolloServerPluginInlineTrace yourself; if you want to never
  //    include these traces even for federated schemas you can use
  //    ApolloServerPluginInlineTraceDisabled.
  // 2) Determining whether schema-reporting should be allowed; federated
  //    services shouldn't be reporting schemas, and we accordingly throw if
  //    it's attempted.
  private schemaIsFederated(schema: GraphQLSchema): boolean {
    const serviceType = schema.getType('_Service');
    if (!(serviceType && isObjectType(serviceType))) {
      return false;
    }
    const sdlField = serviceType.getFields().sdl;
    if (!sdlField) {
      return false;
    }
    const sdlFieldType = sdlField.type;
    if (!isScalarType(sdlFieldType)) {
      return false;
    }
    return sdlFieldType.name == 'String';
  }

  private ensurePluginInstantiation(plugins: PluginDefinition[] = []): void {
    const pluginsToInit: PluginDefinition[] = [];

    // Internal plugins should be added to `pluginsToInit` here.
    // User's plugins, provided as an argument to this method, will be added
    // at the end of that list so they take precedence.

    // If the user has enabled it explicitly, add our tracing plugin.
    // (This is the plugin which adds a verbose JSON trace to every GraphQL response;
    // it was designed for use with the obsolete engineproxy, and also works
    // with a graphql-playground trace viewer, but isn't generally recommended
    // (eg, it really does send traces with every single request). The newer
    // inline tracing plugin may be what you want, or just usage reporting if
    // the goal is to get traces to Apollo's servers.)
    if (this.config.tracing) {
      pluginsToInit.push(pluginTracing())
    }

    // Enable cache control unless it was explicitly disabled.
    if (this.config.cacheControl !== false) {
      let cacheControlOptions: CacheControlExtensionOptions = {};
      if (
        typeof this.config.cacheControl === 'boolean' &&
        this.config.cacheControl === true
      ) {
        // cacheControl: true means that the user needs the cache-control
        // extensions. This means we are running the proxy, so we should not
        // strip out the cache control extension and not add cache-control headers
        cacheControlOptions = {
          stripFormattedExtensions: false,
          calculateHttpHeaders: false,
          defaultMaxAge: 0,
        };
      } else {
        // Default behavior is to run default header calculation and return
        // no cacheControl extensions
        cacheControlOptions = {
          stripFormattedExtensions: true,
          calculateHttpHeaders: true,
          defaultMaxAge: 0,
          ...this.config.cacheControl,
        };
      }

      pluginsToInit.push(pluginCacheControl(cacheControlOptions));
    }

    const federatedSchema = this.schema && this.schemaIsFederated(this.schema);

    pluginsToInit.push(...plugins);

    this.plugins = pluginsToInit.map(plugin => {
      if (typeof plugin === 'function') {
        return plugin();
      }
      return plugin;
    });

    const alreadyHavePluginWithInternalId = (id: InternalPluginId) =>
      this.plugins.some(
        (p) => pluginIsInternal(p) && p.__internal_plugin_id__() === id,
      );

    // Special case: usage reporting is on by default if you configure an API key.
    {
      const alreadyHavePlugin = alreadyHavePluginWithInternalId(
        'UsageReporting',
      );
      if (!alreadyHavePlugin && this.apolloConfig.key) {
        // Keep this plugin first so it wraps everything. (Unfortunately despite
        // the fact that the person who wrote this line also was the original
        // author of the comment above in #1105, they don't quite understand why this was important.)
        this.plugins.unshift(ApolloServerPluginUsageReporting());
      }
    }

    // Special case: schema reporting can be turned on via environment variable.
    {
      const alreadyHavePlugin = alreadyHavePluginWithInternalId(
        'SchemaReporting',
      );
      const enabledViaEnvVar = process.env.APOLLO_SCHEMA_REPORTING === 'true';
      if (alreadyHavePlugin || enabledViaEnvVar) {
        if (federatedSchema) {
          throw Error(
            [
              'Schema reporting is not yet compatible with federated services.',
              "If you're interested in using schema reporting with federated",
              'services, please contact Apollo support. To set up managed federation, see',
              'https://go.apollo.dev/s/managed-federation'
            ].join(' '),
          );
        }
        if (this.config.gateway) {
          throw new Error(
            [
              "Schema reporting is not yet compatible with the gateway. If you're",
              'interested in using schema reporting with the gateway, please',
              'contact Apollo support. To set up managed federation, see',
              'https://go.apollo.dev/s/managed-federation'
            ].join(' '),
          );
        }
      }
      if (!alreadyHavePlugin) {
        if (!this.apolloConfig.key) {
          if (enabledViaEnvVar) {
            throw new Error(
              "You've enabled schema reporting by setting the APOLLO_SCHEMA_REPORTING " +
                'environment variable to true, but you also need to provide your ' +
                'Apollo API key, via the APOLLO_KEY environment ' +
                'variable or via `new ApolloServer({apollo: {key})',
            );
          }
        } else if (enabledViaEnvVar) {
          const options: ApolloServerPluginSchemaReportingOptions = {};
          this.plugins.push(ApolloServerPluginSchemaReporting(options));
        }
      }
    }

    // Special case: inline tracing is on by default for federated schemas.
    {
      const alreadyHavePlugin = alreadyHavePluginWithInternalId('InlineTrace');
      if (!alreadyHavePlugin && federatedSchema) {
        // If we have a federated schema, and we haven't explicitly disabled inline
        // tracing via ApolloServerPluginInlineTraceDisabled or engine:false,
        // we set up inline tracing.
        // (This is slightly different than the pre-ApolloServerPluginInlineTrace where
        // we would also avoid doing this if an API key was configured and log a warning.)
        this.logger.info(
          'Enabling inline tracing for this federated service. To disable, use ' +
            'ApolloServerPluginInlineTraceDisabled.',
        );
        this.plugins.push(ApolloServerPluginInlineTrace());
      }
    }
  }

  private initializeDocumentStore(): InMemoryLRUCache<DocumentNode> {
    return new InMemoryLRUCache<DocumentNode>({
      // Create ~about~ a 30MiB InMemoryLRUCache.  This is less than precise
      // since the technique to calculate the size of a DocumentNode is
      // only using JSON.stringify on the DocumentNode (and thus doesn't account
      // for unicode characters, etc.), but it should do a reasonable job at
      // providing a caching document store for most operations.
      maxSize:
        Math.pow(2, 20) *
        (this.experimental_approximateDocumentStoreMiB || 30),
      sizeCalculator: approximateObjectSize,
    });
  }

  // This function is used by the integrations to generate the graphQLOptions
  // from an object containing the request and other integration specific
  // options
  protected async graphQLServerOptions(
    integrationContextArgument?: Record<string, any>,
  ): Promise<GraphQLServerOptions> {
    const {
      schema,
      schemaHash,
      documentStore,
    } = await this.schemaDerivedData;

    let context: Context = this.context ? this.context : {};

    try {
      context =
        typeof this.context === 'function'
          ? await this.context(integrationContextArgument || {})
          : context;
    } catch (error) {
      // Defer context error resolution to inside of runQuery
      context = () => {
        throw error;
      };
    }

    return {
      schema,
      schemaHash,
      logger: this.logger,
      plugins: this.plugins,
      documentStore,
      context,
      // Allow overrides from options. Be explicit about a couple of them to
      // avoid a bad side effect of the otherwise useful noUnusedLocals option
      // (https://github.com/Microsoft/TypeScript/issues/21673).
      persistedQueries: this.requestOptions
        .persistedQueries as PersistedQueryOptions,
      fieldResolver: this.requestOptions.fieldResolver as GraphQLFieldResolver<
        any,
        any
      >,
      parseOptions: this.parseOptions,
      ...this.requestOptions,
    };
  }

  public async executeOperation(request: GraphQLRequest) {
    const options = await this.graphQLServerOptions();

    if (typeof options.context === 'function') {
      options.context = (options.context as () => never)();
    } else if (typeof options.context === 'object') {
      // FIXME: We currently shallow clone the context for every request,
      // but that's unlikely to be what people want.
      // We allow passing in a function for `context` to ApolloServer,
      // but this only runs once for a batched request (because this is resolved
      // in ApolloServer#graphQLServerOptions, before runHttpQuery is invoked).
      // NOTE: THIS IS DUPLICATED IN runHttpQuery.ts' buildRequestContext.
      options.context = cloneObject(options.context);
    }


    const requestCtx: GraphQLRequestContext = {
      logger: this.logger,
      schema: options.schema,
      schemaHash: options.schemaHash,
      request,
      context: options.context || Object.create(null),
      cache: options.cache!,
      metrics: {},
      response: {
        http: {
          headers: new Headers(),
        },
      },
    };

    return processGraphQLRequest(options, requestCtx);
  }
}
