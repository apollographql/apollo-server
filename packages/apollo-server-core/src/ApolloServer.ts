import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  IResolvers,
  mergeSchemas,
} from 'graphql-tools';
import { Server as HttpServer } from 'http';
import {
  execute,
  print,
  GraphQLSchema,
  subscribe,
  ExecutionResult,
  GraphQLError,
  GraphQLFieldResolver,
  ValidationContext,
  FieldDefinitionNode,
} from 'graphql';
import { GraphQLExtension } from 'graphql-extensions';
import { TracingExtension } from 'apollo-tracing';
import { CacheControlExtension } from 'apollo-cache-control';
import { EngineReportingAgent } from 'apollo-engine-reporting';

import { ApolloEngine } from 'apollo-engine';
import {
  SubscriptionServer,
  ExecutionParams,
} from 'subscriptions-transport-ws';

import { formatApolloErrors } from './errors';
import { GraphQLServerOptions as GraphQLOptions } from './graphqlOptions';
import { LogFunction } from './logging';

import {
  Config,
  ListenOptions,
  RegistrationOptions,
  ServerInfo,
  Context,
  ContextFunction,
  SubscriptionServerOptions,
} from './types';

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

export class ApolloServerBase<Request = RequestInit> {
  public disableTools: boolean;
  // set in the listen function if subscriptions are enabled
  public subscriptionsPath: string;
  public requestOptions: Partial<GraphQLOptions<any>>;

  private schema: GraphQLSchema;
  private context?: Context | ContextFunction;
  private graphqlPath: string = '/graphql';
  private engineReportingAgent?: EngineReportingAgent;
  private engineProxy: ApolloEngine;
  private extensions: Array<() => GraphQLExtension>;

  private http?: HttpServer;
  private subscriptionServer?: SubscriptionServer;
  protected getHttp: () => HttpServer;

  constructor(config: Config) {
    const {
      context,
      resolvers,
      schema,
      schemaDirectives,
      typeDefs,
      introspection,
      mocks,
      extensions,
      engine,
      ...requestOptions
    } = config;

    //While reading process.env is slow, a server should only be constructed
    //once per run, so we place the env check inside the constructor. If env
    //should be used outside of the constructor context, place it as a private
    //or protected field of the class instead of a global. Keeping the read in
    //the contructor enables testing of different environments
    const env = process.env.NODE_ENV;
    const isDev = env !== 'production' && env !== 'test';

    // if this is local dev, we want graphql gui and introspection to be turned on
    // in production, you can manually turn these on by passing { introspection: true }
    // to the constructor of ApolloServer
    // we use this.disableTools to track this internally for later use when
    // constructing middleware by frameworks
    if (typeof introspection === 'boolean') this.disableTools = !introspection;
    else this.disableTools = !isDev;

    if (this.disableTools) {
      const noIntro = [NoIntrospection];
      requestOptions.validationRules = requestOptions.validationRules
        ? requestOptions.validationRules.concat(noIntro)
        : noIntro;
    }

    this.requestOptions = requestOptions;
    this.context = context;

    if (
      typeof typeDefs === 'string' ||
      (Array.isArray(typeDefs) && typeDefs.find(d => typeof d === 'string'))
    ) {
      const startSchema =
        (typeof typeDefs === 'string' &&
          (typeDefs as string).substring(0, 200)) ||
        (Array.isArray(typeDefs) &&
          (typeDefs.find(d => typeof d === 'string') as any).substring(0, 200));
      throw new Error(`typeDefs must be tagged with the gql exported from apollo-server:

const { gql } = require('apollo-server');

const typeDefs = gql\`${startSchema}\`
`);
    }

    const enhancedTypeDefs = Array.isArray(typeDefs)
      ? typeDefs.map(print)
      : [print(typeDefs)];
    enhancedTypeDefs.push(`scalar Upload`);

    this.schema = schema
      ? schema
      : makeExecutableSchema({
          typeDefs: enhancedTypeDefs.join('\n'),
          schemaDirectives,
          resolvers,
        });

    if (mocks) {
      addMockFunctionsToSchema({
        schema: this.schema,
        preserveResolvers: true,
        mocks: typeof mocks === 'boolean' ? {} : mocks,
      });
    }

    // Note: if we're using engineproxy (directly or indirectly), we will extend
    // this when we listen.
    this.extensions = [];

    if (engine || (engine !== false && process.env.ENGINE_API_KEY)) {
      this.engineReportingAgent = new EngineReportingAgent(
        engine === true ? {} : engine,
      );
      // Let's keep this extension first so it wraps everything.
      this.extensions.push(() => this.engineReportingAgent.newExtension());
    }

    if (extensions) {
      this.extensions = [...this.extensions, ...extensions];
    }
  }

  public use({ getHttp, path }: RegistrationOptions) {
    // we need to delay when we actually get the http server
    // until we move into the listen function
    this.getHttp = getHttp;
    this.graphqlPath = path;
  }

  public enhanceSchema(
    schema: GraphQLSchema | { typeDefs: string; resolvers: IResolvers },
  ) {
    this.schema = mergeSchemas({
      schemas: [
        this.schema,
        'typeDefs' in schema ? schema['typeDefs'] : schema,
      ],
      resolvers: 'resolvers' in schema ? [, schema['resolvers']] : {},
    });
  }

  public listen(opts: ListenOptions = {}): Promise<ServerInfo> {
    this.http = this.getHttp();

    const options = {
      ...opts,
      http: {
        port: process.env.PORT || 4000,
        ...opts.http,
      },
    };

    if (opts.subscriptions !== false) {
      let config: SubscriptionServerOptions;
      if (
        opts.subscriptions === true ||
        typeof opts.subscriptions === 'undefined'
      ) {
        config = {
          path: this.graphqlPath,
        };
      } else if (typeof opts.subscriptions === 'string') {
        config = { path: opts.subscriptions };
      } else {
        config = { path: this.graphqlPath, ...opts.subscriptions };
      }

      this.subscriptionsPath = config.path;
      this.subscriptionServer = this.createSubscriptionServer(
        this.http,
        config,
      );
    }

    if (opts.engineProxy || opts.engineInRequestPath) this.createEngine(opts);

    return new Promise((resolve, reject) => {
      if (this.engineProxy) {
        this.engineProxy.listen(
          {
            graphqlPaths: [this.graphqlPath],
            port: options.http.port,
            httpServer: this.http,
            launcherOptions: options.engineLauncherOptions,
          },
          () => {
            this.engineProxy.engineListeningAddress.url = require('url').resolve(
              this.engineProxy.engineListeningAddress.url,
              this.graphqlPath,
            );
            resolve(this.engineProxy.engineListeningAddress);
          },
        );
        this.engineProxy.on('error', reject);
        return;
      }

      // all options for http listeners
      // https://nodejs.org/api/net.html#net_server_listen_options_callback
      // https://github.com/apollographql/apollo-server/pull/979/files/33ea0c92a1e4e76c8915ff08806f15dae391e1f0#discussion_r184470435
      // https://github.com/apollographql/apollo-server/pull/979#discussion_r184471445
      function listenCallback() {
        const listeningAddress: any = this.http.address();
        // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
        // corresponding loopback ip. Note that the url field we're setting is
        // primarily for consumption by our test suite. If this heuristic is
        // wrong for your use case, explicitly specify a frontend host (in the
        // `frontends.host` field in your engine config, or in the `host`
        // option to ApolloServer.listen).
        let hostForUrl = listeningAddress.address;
        if (
          listeningAddress.address === '' ||
          listeningAddress.address === '::'
        )
          hostForUrl = 'localhost';

        listeningAddress.url = require('url').format({
          protocol: 'http',
          hostname: hostForUrl,
          port: listeningAddress.port,
          pathname: this.graphqlPath,
        });

        resolve(listeningAddress);
      }

      if (options.http.handle) {
        this.http.listen(
          options.http.handle,
          options.http.backlog,
          listenCallback.bind(this),
        );
      } else {
        this.http.listen(options.http, listenCallback.bind(this));
      }
    });
  }

  public async stop() {
    if (this.engineProxy) await this.engineProxy.stop();
    if (this.subscriptionServer) await this.subscriptionServer.close();
    if (this.http) await new Promise(s => this.http.close(s));
  }

  private createSubscriptionServer(
    server: HttpServer,
    config: SubscriptionServerOptions,
  ) {
    const { onDisconnect, onConnect, keepAlive, path } = config;

    return SubscriptionServer.create(
      {
        schema: this.schema,
        execute,
        subscribe,
        onConnect: onConnect
          ? onConnect
          : (connectionParams: Object) => ({ ...connectionParams }),
        onDisconnect: onDisconnect,
        onOperation: async (_: string, connection: ExecutionParams) => {
          connection.formatResponse = (value: ExecutionResult) => ({
            ...value,
            errors:
              value.errors &&
              formatApolloErrors([...value.errors], {
                formatter: this.requestOptions.formatError,
                debug: this.requestOptions.debug,
                logFunction: this.requestOptions.logFunction,
              }),
          });
          let context: Context = this.context ? this.context : { connection };

          try {
            context =
              typeof this.context === 'function'
                ? await this.context({ connection })
                : context;
          } catch (e) {
            throw formatApolloErrors([e], {
              formatter: this.requestOptions.formatError,
              debug: this.requestOptions.debug,
              logFunction: this.requestOptions.logFunction,
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

  private createEngine({ engineInRequestPath, engineProxy }: ListenOptions) {
    // only access this onces as its slower on node
    const { ENGINE_API_KEY, ENGINE_CONFIG } = process.env;
    if (engineProxy === false && (ENGINE_API_KEY || ENGINE_CONFIG)) {
      console.warn(
        'engine is set to false when creating ApolloServer but either ENGINE_CONFIG or ENGINE_API_KEY was found in the environment',
      );
    }
    let ApolloEngine;
    if (engineProxy) {
      // detect engine if it is set to true or has a config, and possibly load it
      try {
        ApolloEngine = require('apollo-engine').ApolloEngine;
      } catch (e) {
        console.warn(`ApolloServer was unable to load Apollo Engine yet engine was configured in the options when creating this ApolloServer? To fix this, run the following command:

  npm install apollo-engine --save
`);
      }

      this.engineProxy = new ApolloEngine(
        typeof engineProxy === 'boolean' ? undefined : engineProxy,
      );
    }

    // XXX should this allow for header overrides from graphql-playground?
    if (this.engineProxy || engineInRequestPath) {
      this.extensions.push(() => new TracingExtension());
      // XXX provide a way to pass options to CacheControlExtension (eg
      // defaultMaxAge)
      this.extensions.push(() => new CacheControlExtension());
    }
  }

  async graphQLServerOptionsForRequest(request: Request) {
    let context: Context = this.context ? this.context : { request };

    try {
      context =
        typeof this.context === 'function'
          ? await this.context({ req: request })
          : context;
    } catch (error) {
      //Defer context error resolution to inside of runQuery
      context = () => {
        throw error;
      };
    }

    return {
      schema: this.schema,
      extensions: this.extensions,
      context,
      // Allow overrides from options. Be explicit about a couple of them to
      // avoid a bad side effect of the otherwise useful noUnusedLocals option
      // (https://github.com/Microsoft/TypeScript/issues/21673).
      logFunction: this.requestOptions.logFunction as LogFunction,
      fieldResolver: this.requestOptions.fieldResolver as GraphQLFieldResolver<
        any,
        any
      >,
      ...this.requestOptions,
    };
  }
}
