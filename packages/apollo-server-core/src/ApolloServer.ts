import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { Server as HttpServer } from 'http';
import {
  execute,
  GraphQLSchema,
  subscribe,
  ExecutionResult,
  GraphQLError,
  GraphQLResolveInfo,
  ValidationContext,
  FieldDefinitionNode,
} from 'graphql';

import { ApolloEngine } from 'apollo-engine';
import {
  SubscriptionServer,
  ExecutionParams,
} from 'subscriptions-transport-ws';

import { formatApolloErrors } from './errors';
import { GraphQLServerOptions as GraphQLOptions } from './graphqlOptions';
import { LogFunction, LogAction, LogStep } from './logging';

import {
  Config,
  ListenOptions,
  MiddlewareOptions,
  RegistrationOptions,
  ServerInfo,
  Context,
  ContextFunction,
} from './types';

const env = process.env.NODE_ENV;
const isDev = env !== 'production' && env !== 'test';

const NoIntrospection = (context: ValidationContext) => ({
  Field(node: FieldDefinitionNode) {
    if (node.name.value === '__schema' || node.name.value === '__type') {
      context.reportError(
        new GraphQLError(
          'GraphQL introspection is not allowed by Apollo Server, but the query containted __schema or __type. To enable introspection, pass introspection: true to ApolloServer in production',
          [node],
        ),
      );
    }
  },
});

export class ApolloServerBase<Request = RequestInit> {
  public disableTools: boolean = !isDev;
  public subscriptionsEnabled: boolean = false;

  private schema: GraphQLSchema;
  private context?: Context | ContextFunction;
  private requestOptions: Partial<GraphQLOptions<any>>;
  private graphqlPath: string = '/graphql';
  private engineProxy: ApolloEngine;
  private engineEnabled: boolean = false;

  private http?: HttpServer;
  protected getHttp: () => HttpServer;

  constructor(config: Config<Request>) {
    const {
      context,
      resolvers,
      schema,
      schemaDirectives,
      typeDefs,
      enableIntrospection,
      mocks,
      ...requestOptions
    } = config;

    // if this is local dev, we want graphql gui and introspection to be turned on
    // in production, you can manually turn these on by passing { enableIntrospection: true }
    // to the constructor of ApolloServer
    // we use this.disableTools to track this internally for later use when
    // constructing middleware by frameworks
    if (enableIntrospection || isDev) this.disableTools = false;

    if (this.disableTools) {
      const noIntro = [NoIntrospection];
      requestOptions.validationRules = requestOptions.validationRules
        ? requestOptions.validationRules.concat(noIntro)
        : noIntro;
    }

    this.requestOptions = requestOptions;
    this.context = context;

    this.schema = schema
      ? schema
      : makeExecutableSchema({
          typeDefs: Array.isArray(typeDefs)
            ? typeDefs.reduce((prev, next) => prev + '\n' + next)
            : typeDefs,
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
  }

  public use({ getHttp, path }: RegistrationOptions) {
    // we need to delay when we actually get the http server
    // until we move into the listen function
    this.getHttp = getHttp;
    this.graphqlPath = path;
  }

  public listen(opts: ListenOptions = {}): Promise<ServerInfo> {
    this.http = this.getHttp();

    const options = {
      port: process.env.PORT || 4000,
      ...opts,
    };

    if (opts.subscriptions !== false) {
      const config: any =
        opts.subscriptions === true || typeof opts.subscriptions === 'undefined'
          ? {
              path: this.graphqlPath,
            }
          : opts.subscriptions;
      this.subscriptionsEnabled = true;
      this.createSubscriptionServer(this.http, config);
    }

    if (opts.engineProxy || opts.engineInRequestPath) this.createEngine(opts);

    return new Promise((success, fail) => {
      if (this.engineProxy) {
        this.engineProxy.listen(
          {
            graphqlPaths: [this.graphqlPath],
            port: options.port,
            httpServer: this.http,
            launcherOptions: options.engineLauncherOptions,
          },
          () => {
            this.engineProxy.engineListeningAddress.url = require('url').resolve(
              this.engineProxy.engineListeningAddress.url,
              this.graphqlPath,
            );
            success(this.engineProxy.engineListeningAddress);
          },
        );
        this.engineProxy.on('error', fail);
        return;
      }

      // all options for http listeners
      // https://nodejs.org/api/net.html#net_server_listen_options_callback
      this.http.listen(
        {
          port: options.port,
          host: options.host,
          path: options.path,
          backlog: options.backlog,
          exclusive: options.exclusive,
        },
        () => {
          const la: any = this.http.address();
          // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
          // corresponding loopback ip. Note that the url field we're setting is
          // primarily for consumption by our test suite. If this heuristic is
          // wrong for your use case, explicitly specify a frontend host (in the
          // `frontends.host` field in your engine config, or in the `host`
          // option to ApolloServer.listen).
          let hostForUrl = la.address;
          if (la.address === '' || la.address === '::')
            hostForUrl = 'localhost';

          la.url = require('url').format({
            protocol: 'http',
            hostname: hostForUrl,
            port: la.port,
            pathname: this.graphqlPath,
          });

          success(la);
        },
      );
    });
  }

  public async stop() {
    if (this.engineProxy) await this.engineProxy.stop();
    if (this.http) await new Promise(s => this.http.close(s));
  }

  private createSubscriptionServer(server: HttpServer, config: ListenOptions) {
    const { onDisconnect, onConnect, keepAlive } = config;
    SubscriptionServer.create(
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
              formatApolloErrors(value.errors, {
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
        path: this.graphqlPath,
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
    if (this.engineProxy || engineInRequestPath) this.engineEnabled = true;
  }

  request(request: Request) {
    let context: Context = this.context ? this.context : { request };

    //Defer context resolution to inside of runQuery
    context =
      typeof this.context === 'function'
        ? () => this.context({ req: request })
        : context;

    return {
      schema: this.schema,
      tracing: Boolean(this.engineEnabled),
      cacheControl: Boolean(this.engineEnabled),
      context,
      // allow overrides from options
      ...this.requestOptions,
    };
  }
}
