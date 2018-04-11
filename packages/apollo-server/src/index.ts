import * as express from 'express';
import * as cors from 'cors';
import { json } from 'body-parser';

import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';

import { Server as HttpServer } from 'http';

import { ApolloServerBase } from './utils/ApolloServer';
import { ListenOptions, ServerInfo } from './utils/types';

export * from './utils/exports';

import { ApolloServer as ExpressServer } from './express';

export class ApolloServer extends ExpressServer {
  constructor(opts) {
    opts.app = express();
    super(opts);
    super.applyMiddleware();
  }
}
