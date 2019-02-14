import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  GraphQLParseOptions,
} from 'graphql-tools';
import { Server as HttpServer } from 'http';
import {
  execute,
  GraphQLSchema,
  subscribe,
  ExecutionResult,
  GraphQLError,
  GraphQLFieldResolver,
  ValidationContext,
  FieldDefinitionNode,
  DocumentNode,
} from 'graphql';
import { GraphQLExtension } from 'graphql-extensions';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import runtimeSupportsUploads from './utils/runtimeSupportsUploads';

import {
  SubscriptionServer,
  ExecutionParams,
} from 'subscriptions-transport-ws';

import { formatApolloErrors } from 'apollo-server-errors';
import {
  GraphQLServerOptions as GraphQLOptions,
  PersistedQueryOptions,
} from './graphqlOptions';

import {
  Config,
  Context,
  ContextFunction,
  SubscriptionServerOptions,
  FileUploadOptions,
  PluginDefinition,
} from './types';

import { FormatErrorExtension } from './formatters';

import { gql } from './index';

import {
  createPlaygroundOptions,
  PlaygroundRenderPageOptions,
} from './playground';

import { generateSchemaHash } from './utils/schemaHash';
import {
  processGraphQLRequest,
  GraphQLRequestContext,
  GraphQLRequest,
} from './requestPipeline';

import { Headers } from 'apollo-server-env';
import { buildServiceDefinition } from '@apollographql/apollo-tools';

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

function getEngineServiceId(engine: Config['engine']): string | undefined {
  const keyFromEnv = process.env.ENGINE_API_KEY || '';
  if (!(engine || (engine !== false && keyFromEnv))) {
    return;
  }

  let engineApiKey: string = '';

  if (typeof engine === 'object' && engine.apiKey) {
    engineApiKey = engine.apiKey;
  } else if (keyFromEnv) {
    engineApiKey = keyFromEnv;
  }

  if (engineApiKey) {
    return engineApiKey.split(':', 2)[1];
  }

  return;
}

const forbidUploadsForTesting =
  process && process.env.NODE_ENV === 'test' && !runtimeSupportsUploads;

function approximateObjectSize<T>(obj: T): number {
  return Buffer.byteLength(JSON.stringify(obj), 'utf8');
}

export class ApolloServerBase {
  public subscriptionsPath?: string;
  public graphqlPath: string = '/graphql';
  public requestOptions: Partial<GraphQLOptions<any>> = Object.create(null);

  private context?: Context | ContextFunction;
  private engineReportingAgent?: import('apollo-engine-reporting').EngineReportingAgent;
  private engineServiceId?: string;
  private extensions: Array<() => GraphQLExtension>;
  private schemaHash: string;
  protected plugins: ApolloServerPlugin[] = [];

  protected schema: GraphQLSchema;
  protected subscriptionServerOptions?: SubscriptionServerOptions;
  protected uploadsConfig?: FileUploadOptions;

  // set by installSubscriptionHandlers.
  private subscriptionServer?: SubscriptionServer;

  // the default version is specified in playground.ts
  protected playgroundOptions?: PlaygroundRenderPageOptions;

  // A store that, when enabled (default), will store the parsed and validated
  // versions of operations in-memory, allowing subsequent parses/validates
  // on the same operation to be executed immediately.
  private documentStore?: InMemoryLRUCache<DocumentNode>;

  private parseOptions: GraphQLParseOptions;

  // The constructor should be universal across all environments. All environment specific behavior should be set by adding or overriding methods
  constructor(config: Config) {
    if (!config) throw new Error('ApolloServer requires options.');
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
      extensions,
      engine,
      subscriptions,
      uploads,
      playground,
      plugins,
      ...requestOptions
    } = config;

    // Initialize the document store.  This cannot currently be disabled.
    this.initializeDocumentStore();

    // Plugins will be instantiated if they aren't already, and this.plugins
    // is populated accordingly.
    this.ensurePluginInstantiation(plugins);

    // While reading process.env is slow, a server should only be constructed
    // once per run, so we place the env check inside the constructor. If env
    // should be used outside of the constructor context, place it as a private
    // or protected field of the class instead of a global. Keeping the read in
    // the contructor enables testing of different environments
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

    if (requestOptions.cacheControl !== false) {
      if (
        typeof requestOptions.cacheControl === 'boolean' &&
        requestOptions.cacheControl === true
      ) {
        // cacheControl: true means that the user needs the cache-control
        // extensions. This means we are running the proxy, so we should not
        // strip out the cache control extension and not add cache-control headers
        requestOptions.cacheControl = {
          stripFormattedExtensions: false,
          calculateHttpHeaders: false,
          defaultMaxAge: 0,
        };
      } else {
        // Default behavior is to run default header calculation and return
        // no cacheControl extensions
        requestOptions.cacheControl = {
          stripFormattedExtensions: true,
          calculateHttpHeaders: true,
          defaultMaxAge: 0,
          ...requestOptions.cacheControl,
        };
      }
    }

    if (!requestOptions.cache) {
      requestOptions.cache = new InMemoryLRUCache();
    }

    if (requestOptions.persistedQueries !== false) {
      if (!requestOptions.persistedQueries) {
        requestOptions.persistedQueries = {
          cache: requestOptions.cache!,
        };
      }
    } else {
      // the user does not want to use persisted queries, so we remove the field
      delete requestOptions.persistedQueries;
    }

    this.requestOptions = requestOptions as GraphQLOptions;
    this.context = context;

    if (uploads !== false && !forbidUploadsForTesting) {
      if (this.supportsUploads()) {
        if (!runtimeSupportsUploads) {
          printNodeFileUploadsMessage();
          throw new Error(
            '`graphql-upload` is no longer supported on Node.js < v8.5.0.  ' +
              'See https://bit.ly/gql-upload-node-6.',
          );
        }

        if (uploads === true || typeof uploads === 'undefined') {
          this.uploadsConfig = {};
        } else {
          this.uploadsConfig = uploads;
        }
        //This is here to check if uploads is requested without support. By
        //default we enable them if supported by the integration
      } else if (uploads) {
        throw new Error(
          'This implementation of ApolloServer does not support file uploads because the environment cannot accept multi-part forms',
        );
      }
    }

    if (schema) {
      this.schema = schema;
    } else if (modules) {
      const { schema, errors } = buildServiceDefinition(modules);
      if (errors && errors.length > 0) {
        throw new Error(errors.map(error => error.message).join('\n\n'));
      }
      this.schema = schema!;
    } else {
      if (!typeDefs) {
        throw Error(
          'Apollo Server requires either an existing schema, modules or typeDefs',
        );
      }

      let augmentedTypeDefs = Array.isArray(typeDefs) ? typeDefs : [typeDefs];

      // We augment the typeDefs with the @cacheControl directive and associated
      // scope enum, so makeExecutableSchema won't fail SDL validation
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

      if (this.uploadsConfig) {
        const { GraphQLUpload } = require('graphql-upload');
        if (resolvers && !resolvers.Upload) {
          resolvers.Upload = GraphQLUpload;
        }

        // We augment the typeDefs with the Upload scalar, so typeDefs that
        // don't include it won't fail
        augmentedTypeDefs.push(
          gql`
            scalar Upload
          `,
        );
      }

      this.schema = makeExecutableSchema({
        typeDefs: augmentedTypeDefs,
        schemaDirectives,
        resolvers,
        parseOptions,
      });
    }

    this.parseOptions = parseOptions;

    if (mocks || (typeof mockEntireSchema !== 'undefined' && mocks !== false)) {
      addMockFunctionsToSchema({
        schema: this.schema,
        mocks:
          typeof mocks === 'boolean' || typeof mocks === 'undefined'
            ? {}
            : mocks,
        preserveResolvers:
          typeof mockEntireSchema === 'undefined' ? false : !mockEntireSchema,
      });
    }

    // The schema hash is a string representation of the shape of the schema
    // it is used for reporting and can be used for a cache key if needed
    this.schemaHash = generateSchemaHash(this.schema);

    // Note: doRunQuery will add its own extensions if you set tracing,
    // or cacheControl.
    this.extensions = [];

    const debugDefault =
      process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
    const debug =
      requestOptions.debug !== undefined ? requestOptions.debug : debugDefault;

    // Error formatting should happen after the engine reporting agent, so that
    // engine gets the unmasked errors if necessary
    this.extensions.push(
      () => new FormatErrorExtension(requestOptions.formatError, debug),
    );

    // In an effort to avoid over-exposing the API key itself, extract the
    // service ID from the API key for plugins which only needs service ID.
    // The truthyness of this value can also be used in other forks of logic
    // related to Engine, as is the case with EngineReportingAgent just below.
    this.engineServiceId = getEngineServiceId(engine);

    if (this.engineServiceId) {
      const { EngineReportingAgent } = require('apollo-engine-reporting');
      this.engineReportingAgent = new EngineReportingAgent(
        typeof engine === 'object' ? engine : Object.create(null),
        {
          schema: this.schema,
          schemaHash: this.schemaHash,
          engine: {
            serviceID: this.engineServiceId,
          },
        },
      );
      // Let's keep this extension second so it wraps everything, except error formatting
      this.extensions.push(() => this.engineReportingAgent!.newExtension());
    }

    if (extensions) {
      this.extensions = [...this.extensions, ...extensions];
    }

    if (subscriptions !== false) {
      if (this.supportsSubscriptions()) {
        if (subscriptions === true || typeof subscriptions === 'undefined') {
          this.subscriptionServerOptions = {
            path: this.graphqlPath,
          };
        } else if (typeof subscriptions === 'string') {
          this.subscriptionServerOptions = { path: subscriptions };
        } else {
          this.subscriptionServerOptions = {
            path: this.graphqlPath,
            ...subscriptions,
          };
        }
        // This is part of the public API.
        this.subscriptionsPath = this.subscriptionServerOptions.path;

        //This is here to check if subscriptions are requested without support. By
        //default we enable them if supported by the integration
      } else if (subscriptions) {
        throw new Error(
          'This implementation of ApolloServer does not support GraphQL subscriptions.',
        );
      }
    }

    this.playgroundOptions = createPlaygroundOptions(playground);
  }

  // used by integrations to synchronize the path with subscriptions, some
  // integrations do not have paths, such as lambda
  public setGraphQLPath(path: string) {
    this.graphqlPath = path;
  }

  protected async willStart() {
    await Promise.all(
      this.plugins.map(
        plugin =>
          plugin.serverWillStart &&
          plugin.serverWillStart({
            schema: this.schema,
            schemaHash: this.schemaHash,
            engine: {
              serviceID: this.engineServiceId,
            },
            persistedQueries: this.requestOptions.persistedQueries,
          }),
      ),
    );
  }

  public async stop() {
    if (this.subscriptionServer) await this.subscriptionServer.close();
    if (this.engineReportingAgent) {
      this.engineReportingAgent.stop();
      await this.engineReportingAgent.sendReport();
    }
  }

  public installSubscriptionHandlers(server: HttpServer) {
    if (!this.subscriptionServerOptions) {
      if (this.supportsSubscriptions()) {
        throw Error(
          'Subscriptions are disabled, due to subscriptions set to false in the ApolloServer constructor',
        );
      } else {
        throw Error(
          'Subscriptions are not supported, choose an integration, such as apollo-server-express that allows persistent connections',
        );
      }
    }

    const {
      onDisconnect,
      onConnect,
      keepAlive,
      path,
    } = this.subscriptionServerOptions;

    this.subscriptionServer = SubscriptionServer.create(
      {
        schema: this.schema,
        execute,
        subscribe,
        onConnect: onConnect
          ? onConnect
          : (connectionParams: Object) => ({ ...connectionParams }),
        onDisconnect: onDisconnect,
        onOperation: async (
          message: { payload: any },
          connection: ExecutionParams,
        ) => {
          connection.formatResponse = (value: ExecutionResult) => ({
            ...value,
            errors:
              value.errors &&
              formatApolloErrors([...value.errors], {
                formatter: this.requestOptions.formatError,
                debug: this.requestOptions.debug,
              }),
          });
          let context: Context = this.context ? this.context : { connection };

          try {
            context =
              typeof this.context === 'function'
                ? await this.context({ connection, payload: message.payload })
                : context;
          } catch (e) {
            throw formatApolloErrors([e], {
              formatter: this.requestOptions.formatError,
              debug: this.requestOptions.debug,
            })[0];
          }

          return { ...connection, context };
        },
        keepAlive,
      },
      {
        server,
        path,
      },
    );
  }

  protected supportsSubscriptions(): boolean {
    return false;
  }

  protected supportsUploads(): boolean {
    return false;
  }

  private ensurePluginInstantiation(plugins?: PluginDefinition[]): void {
    if (!plugins || !plugins.length) {
      return;
    }

    this.plugins = plugins.map(plugin => {
      if (typeof plugin === 'function') {
        return plugin();
      }
      return plugin;
    });
  }

  private initializeDocumentStore(): void {
    this.documentStore = new InMemoryLRUCache<DocumentNode>({
      // Create ~about~ a 30MiB InMemoryLRUCache.  This is less than precise
      // since the technique to calculate the size of a DocumentNode is
      // only using JSON.stringify on the DocumentNode (and thus doesn't account
      // for unicode characters, etc.), but it should do a reasonable job at
      // providing a caching document store for most operations.
      maxSize: Math.pow(2, 20) * 30,
      sizeCalculator: approximateObjectSize,
    });
  }

  // This function is used by the integrations to generate the graphQLOptions
  // from an object containing the request and other integration specific
  // options
  protected async graphQLServerOptions(
    integrationContextArgument?: Record<string, any>,
  ) {
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
      schema: this.schema,
      plugins: this.plugins,
      documentStore: this.documentStore,
      extensions: this.extensions,
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
    } as GraphQLOptions;
  }

  public async executeOperation(request: GraphQLRequest) {
    let options;

    try {
      options = await this.graphQLServerOptions();
    } catch (e) {
      e.message = `Invalid options provided to ApolloServer: ${e.message}`;
      throw new Error(e);
    }

    if (typeof options.context === 'function') {
      options.context = (options.context as () => never)();
    }

    const requestCtx: GraphQLRequestContext = {
      request,
      context: options.context || Object.create(null),
      cache: options.cache!,
      response: {
        http: {
          headers: new Headers(),
        },
      },
    };

    return processGraphQLRequest(options, requestCtx);
  }
}

function printNodeFileUploadsMessage() {
  console.error(
    [
      '*****************************************************************',
      '*                                                               *',
      '* ERROR! Manual intervention is necessary for Node.js < v8.5.0! *',
      '*                                                               *',
      '*****************************************************************',
      '',
      'The third-party `graphql-upload` package, which is used to implement',
      'file uploads in Apollo Server 2.x, no longer supports Node.js LTS',
      'versions prior to Node.js v8.5.0.',
      '',
      'Deployments which NEED file upload capabilities should update to',
      'Node.js >= v8.5.0 to continue using uploads.',
      '',
      'If this server DOES NOT NEED file uploads and wishes to continue',
      'using this version of Node.js, uploads can be disabled by adding:',
      '',
      '  uploads: false,',
      '',
      '...to the options for Apollo Server and re-deploying the server.',
      '',
      'For more information, see https://bit.ly/gql-upload-node-6.',
      '',
    ].join('\n'),
  );
}
