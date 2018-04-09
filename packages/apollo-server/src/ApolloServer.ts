import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';
import { Server as HttpServer } from 'http';

import {
  execute,
  GraphQLSchema,
  subscribe,
  DocumentNode,
  print,
} from 'graphql';
import { ApolloEngine as Engine } from 'apollo-engine';
import { SubscriptionServer } from 'subscriptions-transport-ws';

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

import { formatError } from './errors';

// this makes it easy to get inline formatting and highlighting without
// actually doing any work
export const gql = String.raw;

export class ApolloServerBase<Server = HttpServer, Request = any> {
  app?: Server;
  schema: GraphQLSchema;
  private context?: Context | ContextFunction;
  private engine?: Engine;
  private appCreated: boolean = false;
  private middlewareRegistered: boolean = false;
  private http?: HttpServer;
  private subscriptions?: any;
  private graphqlEndpoint: string = '/graphql';
  private cors?: CorsOptions;

  constructor(config: Config<Server>) {
    const {
      typeDefs,
      resolvers,
      schemaDirectives,
      schema,
      context,
      app,
      engine,
      subscriptions,
      cors,
    } = config;

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
    const shouldLoadEngine = ENGINE_API_KEY || ENGINE_CONFIG;
    if (engine === false && shouldLoadEngine) {
      console.warn(
        'engine is set to false when creating ApolloServer but either ENGINE_CONFIG or ENGINE_API_KEY were found in the environment',
      );
    }
    if (engine !== false) {
      // detect engine, and possibly load it
      try {
        const { ApolloEngine } = require('apollo-engine');
        let engineConfig: any = {};
        if (typeof engine === 'string') engineConfig.apiKey = engine;
        // XXX this can be removed if / when engine does this automatically
        if (typeof engine === 'boolean' || typeof engine === 'undefined') {
          if (ENGINE_API_KEY) engineConfig.apiKey = ENGINE_API_KEY;
          if (!ENGINE_API_KEY) {
            engineConfig.apiKey = 'engine:local:01';
            engineConfig.reporting = { disabled: true };
          }
        }
        // yeah this isn't great, should replace with real check maybe?
        if (typeof engine === 'object') {
          engineConfig = { ...engine };
        }
        this.engine = new ApolloEngine(engineConfig);
      } catch (e) {
        if (shouldLoadEngine) {
          console.warn(`ApolloServer was unable to load Apollo Engine and found environment variables that seem like you want it to be running? To fix this, run the following command:

  npm install apollo-engine --save
`);
        }
      }
    }
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
    const registerOptions: MiddlewareRegistrationOptions<Server, Request> = {
      endpoint: this.graphqlEndpoint,
      graphiql: '/graphiql',
      cors: this.cors,
      ...opts,
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

  public listen(opts: ListenOptions, listenCallback?: (ServerInfo) => void) {
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
    if (!opts) {
      opts = {};
      listenCallback = this.defaultListenCallback;
    }
    if (typeof opts === 'function') {
      listenCallback = opts;
      opts = {};
    }

    if (!listenCallback) listenCallback = this.defaultListenCallback;
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

    if (this.engine) {
      this.engine.listen({ port: options.port, httpServer: this.http }, () => {
        listenCallback(this.engine.engineListeningAddress);
      });
      return;
    }

    this.http.listen(options.port, listenCallback);
  }

  public async stop() {
    if (this.engine) await this.engine.stop();
    if (this.http) await new Promise(s => this.http.close(s));
  }

  private createSubscriptionServer(server: HttpServer, config) {
    const { onDisconnect, onOperation, onConnect, keepAlive, path } = config;
    SubscriptionServer.create(
      {
        schema: this.schema,
        execute,
        subscribe,
        onConnect: onConnect
          ? onConnect
          : (connectionParams, webSocket) => ({ ...connectionParams }),
        onDisconnect: onDisconnect,
        onOperation: async (message, connection, webSocket) => {
          connection.formatResponse = value => ({
            ...value,
            errors: value.errors && value.errors.map(formatError),
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
        path: path || this.graphqlEndpoint,
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
      tracing: Boolean(this.engine),
      cacheControl: Boolean(this.engine),
      logFunction: this.logger,
      formatError,
      context,
    };
  }

  private logger(...args) {
    // console.log(...args);
  }

  private defaultListenCallback({ url }: { url?: string } = {}) {
    console.log(
      `ApolloServer is listening at ${url || 'http://localhost:4000'}`,
    );
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
    config: MiddlewareRegistrationOptions<Server, Request>,
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
