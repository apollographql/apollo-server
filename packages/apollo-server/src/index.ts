import * as express from 'express';
import * as cors from 'cors';
import * as bodyparser from 'body-parser';
import { graphqlExpress } from 'apollo-server-express';
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';
import { createServer, Server as HttpServer } from 'http';
import expressPlayground from 'graphql-playground-middleware-express';
import { ApolloEngine } from 'apollo-engine';
import * as merge from 'lodash.merge';

import { GraphQLSchema } from 'graphql';
import {
  Config,
  ListenOptions,
  ServerInfo,
  Context,
  ContextFunction,
} from './types';

import {
  Node,
  NodeDirective,
  UniqueDirective,
  resolvers as nodeResolvers,
  typeDefs as nodeTypeDefs,
} from './node';

import {
  MutationResponseDirective,
  typeDefs as mutationResponseTypeDefs,
} from './mutationResponse';

import { formatError } from './errors';

export class ApolloServer {
  app: express.Application;
  server?: HttpServer;
  private engine?: ApolloEngine;
  schema: GraphQLSchema;
  context?: Context | ContextFunction;

  constructor(config: Config) {
    const {
      typeDefs,
      resolvers,
      schemaDirectives,
      context,
      app,
      engineApiKey,
    } = config;
    this.app = app ? app : express();

    const apiKey = engineApiKey || process.env.ENGINE_API_KEY;
    this.engine = new ApolloEngine({
      apiKey,
      reporting: { disabled: !apiKey },
    });

    this.context = context;

    const localDefs = nodeTypeDefs + '\n' + mutationResponseTypeDefs;
    this.schema = makeExecutableSchema({
      resolvers: merge(nodeResolvers, resolvers),
      typeDefs: Array.isArray(typeDefs)
        ? typeDefs.reduce((prev, next) => prev + '\n' + next, localDefs)
        : localDefs + '\n' + typeDefs,
      schemaDirectives: merge(
        {
          node: NodeDirective,
          unique: UniqueDirective,
          mutationResponse: MutationResponseDirective,
        },
        schemaDirectives,
      ),
    });
  }

  private defaultListenCallback({ url }: { url: string }) {
    console.log(`ApolloServer is listening at ${url}`);
  }

  public listen(opts: ListenOptions, listenCallback?: (ServerInfo) => void) {
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
      endpoint: '/graphql',
      devTools: '/graphiql',
      ...opts,
    };
    // setup cors
    const corsConfig = options.cors ? cors(options.cors) : cors();
    this.app.use(corsConfig);

    this.app.use(
      options.endpoint,
      bodyparser.json(),
      graphqlExpress(async request => {
        let context: Context = { request };

        try {
          context =
            typeof this.context === 'function'
              ? await this.context({ request })
              : context;
        } catch (e) {
          console.error(e);
          throw e;
        }

        context.Node = new Node(context);

        return {
          schema: this.schema,
          tracing: true,
          cacheControl: true,
          logFunction: this.logger,
          formatError,
          context,
        };
      }),
    );

    if (options.devTools) {
      this.app.get(
        options.devTools,
        expressPlayground({ endpoint: options.endpoint }),
      );
    }

    this.engine.listen({ port: options.port, expressApp: this.app }, () => {
      listenCallback(this.engine.engineListeningAddress);
    });
  }

  public async stop() {
    if (this.engine) await this.engine.stop();
    if (this.server) this.server.close();
  }

  private logger(...args) {
    // console.log(...args);
  }
}

export const gql = String.raw;
