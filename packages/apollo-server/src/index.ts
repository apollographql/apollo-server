import * as express from 'express';

import { Config } from './utils/types';

export * from './utils/exports';
export * from './utils/errors';

import { ApolloServer as ExpressServer } from './express';

export class ApolloServer<Context> extends ExpressServer {
  constructor(opts: Config<express.Application, express.Request, Context>) {
    if (opts.app) {
      throw new Error(`It looks like "app" was passed into ApolloServer. To use a server with middleware, you need to create an ApolloServer from a variant package and pass in your app. This example uses express:

  const { ApolloServer } = require('apollo-server/express');
  const express = require('express');

  const app = express();
  // add your middleware

  const server = new ApolloServer({ app, resolvers, typeDefs });
  // then when you want to add the apollo server middleware
  server.applyMiddleware();
  // then start the server, changing the start url to include /graphiql
  server.listen().then(({ url }) => {
      console.log(\`🚀 Server ready at \${url}/graphiql\`);
  });

`);
    }

    opts.app = express();
    super(opts);
    // when using ApolloServer without another application passed in,
    // we can assume the only thing it will be doing is serving GraphQL
    // because of that, GraphiQL should be the root path.
    super.applyMiddleware({ graphiql: '/' });
  }
}
