import { makeExecutableSchema } from 'graphql-tools';
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
import {
  internalFormatError,
  GraphQLOptions,
  LogFunction,
} from 'apollo-server-core';
import { ApolloEngine as Engine } from 'apollo-engine';
import { CacheControlExtensionOptions } from 'apollo-cache-control';
import {
  SubscriptionServer,
  ExecutionParams,
} from 'subscriptions-transport-ws';

import { CorsOptions } from 'cors';
import {
  Config,
  ListenOptions,
  MiddlewareOptions,
  MiddlewareRegistrationOptions,
  ServerInfo,
  Context,
  ContextFunction,
} from './types';

// export { LogFunction, ValidationContext, GraphQLResolveInfo };

// taken from engine
export function joinHostPort(host: string, port: number) {
  if (host.includes(':')) host = `[${host}]`;
  return `${host}:${port}`;
}

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

export class ApolloServerBase<
  Server = HttpServer,
  Request = any,
  Cors = CorsOptions
> {
  app?: Server;
  schema: GraphQLSchema;
  private context?: Context | ContextFunction;
  private engine?: Engine;
  private appCreated: boolean = false;
  private middlewareRegistered: boolean = false;
  private http?: HttpServer;
  private subscriptions?: any;
  private graphqlPath: string = '/graphql';
  private cors?: Cors;
  private engineEnabled: boolean = false;
  private requestOptions: Partial<GraphQLOptions<any>>;
  private disableTools: boolean = !isDev;

  constructor(config: Config<Server, Request, Cors>) {
    const {
      app,
      context,
      cors,
      engine,
      engineInRequestPath,
      resolvers,
      schema,
      schemaDirectives,
      subscriptions,
      typeDefs,
      enableIntrospection,
      ...requestOptions
    } = config;

    // if this is local dev, we want graphiql and introspection to be turned on
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
    // XXX should we move this to the `start` call? This would make hot
    // reloading eaiser but may not be worth it?
    this.schema = schema
      ? schema
      : makeExecutableSchema({
          typeDefs: Array.isArray(typeDefs)
            ? typeDefs.reduce((prev, next) => prev + '\n' + next)
            : typeDefs,
          schemaDirectives,
          resolvers,
        });

    this.subscriptions = subscriptions;
    this.cors = cors;

    if (app) {
      this.app = app;
    } else {
      this.app = this.createApp();
      this.appCreated = true;
    }

    // only access this onces as its slower on node
    const { ENGINE_API_KEY, ENGINE_CONFIG } = process.env;
    if (engine === false && (ENGINE_API_KEY || ENGINE_CONFIG)) {
      console.warn(
        'engine is set to false when creating ApolloServer but either ENGINE_CONFIG or ENGINE_API_KEY was found in the environment',
      );
    }
    let ApolloEngine;
    if (engine) {
      // detect engine if it is set to true or has a config, and possibly load it
      try {
        ApolloEngine = require('apollo-engine').ApolloEngine;
      } catch (e) {
        console.warn(`ApolloServer was unable to load Apollo Engine yet engine was configured in the options when creating this ApolloServer? To fix this, run the following command:

  npm install apollo-engine --save
`);
      }

      this.engine = new ApolloEngine(
        typeof engine === 'boolean' ? undefined : engine,
      );
    }

    // XXX should this allow for header overrides from graphql-playground?
    if (this.engine || engineInRequestPath) this.engineEnabled = true;
  }

  public applyMiddleware(opts: MiddlewareOptions = {}) {
    if (this.appCreated) {
      throw new Error(`It looks like server.applyMiddleware was called when "app" was not passed into ApolloServer. To use middleware, you need to create an ApolloServer from a variant package and pass in your app:

  const { ApolloServer } = require('apollo-server/express');
  const express = require('express');

  const app = express();
  const server = new ApolloServer({ app, resolvers, typeDefs });
  // then when you want to add the middleware
  server.applyMiddleware();
  // then start the server
  server.listen().then(({ url }) => {
      console.log(\`🚀 Server ready at \${url}\`);
  });

`);
    }

    const registerOptions: MiddlewareRegistrationOptions<
      Server,
      Request,
      Cors
    > = {
      path: opts.path || this.graphqlPath, //user provided or default to /graphql
      cors: this.cors,
      subscriptions: true,
      ...opts,
      graphiql: opts.graphiql && !this.disableTools,
      app: this.app,
      request: this.request.bind(this),
    };

    this.graphqlPath = registerOptions.path;
    // this function can either mutate the app (normal)
    // or some frameworks may need to return a new one
    const possiblyNewServer = this.registerMiddleware(registerOptions);
    this.middlewareRegistered = true;
    if (possiblyNewServer) this.app = possiblyNewServer;
  }

  public listen(opts: ListenOptions = {}): Promise<ServerInfo> {
    if (!this.appCreated && !this.middlewareRegistered) {
      throw new Error(
        `It looks like you are trying to run ApolloServer without applying the middleware. This error is thrown when using a variant of ApolloServer (i.e. require('apollo-server/variant')) and passing in a custom app. To fix this, before you call server.listen, you need to call server.applyMiddleware():

  const app = express();
  const server = new ApolloServer({ app, resolvers, typeDefs });

  // XXX this part is missing currently!
  server.applyMiddleware();

  server.listen().then(({ url }) => {
      console.log(\`🚀 Server ready at \${url}\`);
  });

`,
      );
    }

    const options = {
      port: process.env.PORT || 4000,
      ...opts,
    };

    this.http = this.getHttpServer(this.app);
    if (this.subscriptions !== false) {
      const config =
        this.subscriptions === true || typeof this.subscriptions === 'undefined'
          ? {
              path: this.graphqlPath,
            }
          : this.subscriptions;
      this.createSubscriptionServer(this.http, config);
    }

    return new Promise((success, fail) => {
      if (this.engine) {
        this.engine.listen(
          Object.assign({}, options.engineLauncherOptions, {
            graphqlPaths: [this.graphqlPath],
            port: options.port,
            httpServer: this.http,
          }),
          () => {
            this.engine.engineListeningAddress.url = `${
              this.engine.engineListeningAddress.url
            }/${
              this.graphqlPath.substring(0, 1) === '/'
                ? this.graphqlPath.substring(1)
                : this.graphqlPath
            }`;
            success(this.engine.engineListeningAddress);
          },
        );
        this.engine.on('error', fail);
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
          la.url = `http://${joinHostPort(hostForUrl, la.port)}/${
            this.graphqlPath.substring(0, 1) === '/'
              ? this.graphqlPath.substring(1)
              : this.graphqlPath
          }`;
          success(la);
        },
      );
    });
  }

  public async stop() {
    if (this.engine) await this.engine.stop();
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
              value.errors && value.errors.map(err => internalFormatError(err)),
          });
          let context: Context = this.context ? this.context : { connection };

          try {
            context =
              typeof this.context === 'function'
                ? await this.context({ connection })
                : context;
          } catch (e) {
            console.error(e);
            throw e;
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

  async request(request: Request) {
    if (!this) {
      throw new Error(`It looks like you tried to call this.request but didn't bind it to the parent class. To fix this,
when calling this.request, either call it using an error function, or bind it like so:

  this.request.bind(this);
`);
    }
    let context: Context = this.context ? this.context : { request };

    context =
      typeof this.context === 'function'
        ? await this.context({ req: request })
        : context;

    return {
      schema: this.schema,
      tracing: Boolean(this.engineEnabled),
      cacheControl: Boolean(this.engineEnabled),
      formatError: (e: GraphQLError) =>
        internalFormatError(e, this.requestOptions.debug),
      context,
      // allow overrides from options
      ...this.requestOptions,
    };
  }

  createApp(): Server {
    //TODO add some comparison between variant and non-variant styles
    throw new Error(`It looks tried to create on an ApolloServer that is missing a server! This means that either you need to pass an external server when creating an ApolloServer, or use an ApolloServer variant that supports a default server:

    const { ApolloServer } = require('apollo-server');
    // or for advanced use cases:
    const { ApolloServer } = require('apollo-server/express');

    To see all supported servers and differences, check the docs at https://apollographql.com/docs/server

`);
  }

  registerMiddleware(
    config: MiddlewareRegistrationOptions<Server, Request, Cors>,
  ): Server | void {
    throw new Error(`It looks like you called server.applyMiddleware on an ApolloServer that is missing a server! Make sure you pass in an app when creating a server:

      const { ApolloServer } = require('apollo-server/express');
      const express = require('express');

      const app = express();
      const server = new ApolloServer({ app, typeDefs, resolvers });
`);
  }

  getHttpServer(app: Server): HttpServer {
    throw new Error(
      `It looks like you are trying to use ApolloServer but we couldn't find an http server from your framework. To fix this, please open an issue for you variant at the https://github.com/apollographql/apollo-server repo`,
    );
  }

  closeApp(app: Server): Promise<void> | void {}
}
