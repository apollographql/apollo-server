import * as express from 'express';

import { Config } from './utils/types';

export * from './utils/exports';

import { ApolloServer as ExpressServer } from './express';

export class ApolloServer<Context> extends ExpressServer {
  constructor(opts: Config<express.Application, express.Request, Context>) {
    opts.app = express();
    super(opts);
    super.applyMiddleware();
  }
}
