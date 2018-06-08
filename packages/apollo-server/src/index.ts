import * as express from 'express';
import { Request } from 'express';
import { registerServer } from 'apollo-server-express';

import {
  ApolloServerBase,
  ListenOptions,
  ServerInfo,
} from 'apollo-server-core';

export * from './exports';

export class ApolloServer extends ApolloServerBase<Request> {
  // here we overwrite the underlying listen to configure
  // the fallback / default server implementation
  async listen(opts: ListenOptions = {}): Promise<ServerInfo> {
    // we haven't configured a server yet so lets build the default one
    // using express
    if (!this.getHttp) {
      const app = express();

      //provide generous values for the getting started experience
      await registerServer({
        app,
        path: '/',
        server: this,
        bodyParserConfig: { limit: '50mb' },
        cors: {
          origin: '*',
        },
      });
    }

    return super.listen(opts);
  }
}
