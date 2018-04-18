import * as express from 'express';

import { Config } from './utils/types';

export * from './utils/exports';

import { ApolloServer as ExpressServer } from './express';

export class ApolloServer<Context> extends ExpressServer {
  constructor(opts: Config<express.Application, express.Request, Context>) {
    opts.app = express();
    super(opts);
    // when using ApolloServer without another application passed in,
    // we can assume the only thing it will be doing is serving GraphQL
    // because of that, GraphiQL should be the root path
    super.applyMiddleware({ graphiql: '/' });
  }
}
