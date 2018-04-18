import { makeExecutableSchema } from 'graphql-tools';
import { Server as HttpServer } from 'http';
import {
  execute,
  GraphQLSchema,
  subscribe,
  ExecutionResult,
  GraphQLError,
} from 'graphql';
import { formatError } from 'apollo-server-core';
import { ApolloEngine as Engine } from 'apollo-engine';
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

// taken from engine
export function joinHostPort(host: string, port: number) {
  if (host.includes(':')) host = `[${host}]`;
  return `${host}:${port}`;
}

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
  private graphqlEndpoint: string = '/graphql';
  private cors?: Cors;
  private engineEnabled: boolean = false;
  private debug?: boolean;

  constructor(config: Config<Server, Request, Cors>) {
    const {
      typeDefs,
      resolvers,
      schemaDirectives,
      schema,
      context,
      app,
      engine,
      engineInRequestPath,
      subscriptions,
      cors,
      debug,
    } = config;

    this.debug = debug;
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
    const shouldLoadEngine = ENGINE_API_KEY || ENGINE_CONFIG || engine;
    if (engine === false && shouldLoadEngine) {
      console.warn(
        'engine is set to false when creating ApolloServer but either ENGINE_CONFIG or ENGINE_API_KEY were found in the environment',
      );
    }
    let ApolloEngine;
    if (engine) {
      // detect engine if it is set to true or has a config, and possibly load it
      try {
        ApolloEngine = require('apollo-engine').ApolloEngine;
      } catch (e) {
        if (shouldLoadEngine) {
          console.warn(`ApolloServer was unable to load Apollo Engine and found either environment variables that seem like you want it to be running or engine was configured on the options when creating this ApolloServer? To fix this, run the following command:

  npm install apollo-engine --save
`);
        }
      }

      if (!shouldLoadEngine) {
        throw new Error(`

ApolloServer was unable to load the configuration for Apollo Engine. Please verify that you are either passing in an engine config to the new ApolloServer call, or have set ENGINE_CONFIG or ENGINE_API_KEY in your environment

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
      throw new Error(`It looks like server.applyMiddleware was called when app was not passed into ApolloServer. To use middlware, you need to create an ApolloServer from a variant package and pass in your app:
    const { ApolloServer } = require('apollo-server/express');
    const express = require('express');

    const app = express();
    const server = new ApolloServer({ app, resolvers, typeDefs });
    // then when you want to add the middleware
    server.applyMiddleware();
    // then start the server
    server.listen()
`);
    }

    const registerOptions: MiddlewareRegistrationOptions<
      Server,
      Request,
      Cors
    > = {
      endpoint: this.graphqlEndpoint,
      cors: this.cors,
      subscriptions: true,
      ...opts,
      graphiql:
        opts.graphiql === false ? null : `${opts.graphiql || '/graphiql'}`,
      app: this.app,
      request: this.request.bind(this),
    };

    this.graphqlEndpoint = registerOptions.endpoint;
    // this function can either mutate the app (normal)
    // or some frameworks maj need to return a new one
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

  server.listen();
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
              path: this.graphqlEndpoint,
            }
          : this.subscriptions;
      this.createSubscriptionServer(this.http, config);
    }

    return new Promise((s, f) => {
      if (this.engine) {
        this.engine.listen(
          Object.assign({}, options.engine, {
            graphqlPaths: [this.graphqlEndpoint],
            port: options.port,
            httpServer: this.http,
          }),
          () => s(this.engine.engineListeningAddress),
        );
        this.engine.on('error', f);
        return;
      }

      this.http.listen(options.port, () => {
        const la: any = this.http.address();
        // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
        // corresponding loopback ip. Note that the url field we're setting is
        // primarily for consumption by our test suite. If this heuristic is
        // wrong for your use case, explicitly specify a frontend host (in the
        // `frontends.host` field in your engine config, or in the `host`
        // option to ApolloEngine.listen).
        let hostForUrl = la.address;
        if (la.address === '' || la.address === '::') hostForUrl = 'localhost';
        la.url = `http://${joinHostPort(hostForUrl, la.port)}`;
        s(la);
      });
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
            errors: value.errors && value.errors.map(err => formatError(err)),
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
        path: this.graphqlEndpoint,
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

    try {
      context =
        typeof this.context === 'function'
          ? await this.context({ req: request })
          : context;
    } catch (e) {
      console.error(e);
      throw e;
    }

    return {
      schema: this.schema,
      tracing: Boolean(this.engineEnabled),
      cacheControl: Boolean(this.engineEnabled),
      formatError: (e: GraphQLError) => formatError(e, Boolean(this.debug)),
      debug: Boolean(this.debug),
      context,
    };
  }

  /* region: vanilla ApolloServer */
  createApp(): Server {
    throw new Error(`It looks like you called server.listen on an ApolloServer that is missing a server! This means that either you need to pass an external server when creating an ApolloServer, or use an ApolloServer variant that supports a default server:

    const { ApolloServer } = require('apollo-server');
    // or
    const { ApolloServer } = require('apollo-server/express');
    
    To see all supported servers, check the docs at https://apollographql.com/docs/server
      
`);
  }

  /* end region: vanilla ApolloServer */

  /* region: variant ApolloServer */

  registerMiddleware(
    config: MiddlewareRegistrationOptions<Server, Request, Cors>,
  ): Server | void {
    throw new Error(`It looks like you called server.addMiddleware on an ApolloServer that is missing a server! Make sure you pass in an app when creating a server:
      
      const { ApolloServer } = require('apollo-server/express');
      const express = require('express');
      
      const app = express();
      const server = new ApolloServer({ app, typeDefs, resolvers });
`);
  }

  getHttpServer(app: Server): HttpServer {
    throw new Error(
      `It looks like you are trying to use subscriptions with ApolloServer but we couldn't find an http server from your framework. To fix this, please open an issue for you variant at the apollographql/apollo-server repo`,
    );
  }

  /* end region: variant ApolloServer */

  closeApp(app: Server): Promise<void> | void {}
}
