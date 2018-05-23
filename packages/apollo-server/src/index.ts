import * as express from 'express';
import { Application, Request } from 'express';
import { registerServer } from 'apollo-server-express';
import { OptionsJson } from 'body-parser';
import { CorsOptions } from 'cors';

import {
  ApolloServerBase,
  ListenOptions,
  Config,
  ServerInfo,
} from 'apollo-server-core';

export * from './exports';

export class ApolloServer extends ApolloServerBase<Request> {
  // here we overwrite the underlying listen to configure
  // the fallback / default server implementation
  async listen(
    opts: ListenOptions & {
      onHealthCheck?: (req: Request) => Promise<any>;
      disableHealthCheck?: boolean;
      bodyParserConfig?: OptionsJson;
      cors?: CorsOptions;
    } = {},
  ): Promise<ServerInfo> {
    const {
      disableHealthCheck,
      bodyParserConfig,
      onHealthCheck,
      cors,
      ...listenOpts
    } = opts;

    // we haven't configured a server yet so lets build the default one
    // using express
    if (!this.getHttp) {
      const app = express();

      await registerServer({
        app,
        path: '/',
        server: this,
        disableHealthCheck,
        bodyParserConfig,
        onHealthCheck,
      });
    }

    return super.listen(listenOpts);
  }
}
