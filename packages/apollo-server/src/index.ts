import * as express from 'express';
import { registerServer } from 'apollo-server-express';
import { OptionsJson } from 'body-parser';

import {
  ApolloServerBase,
  ListenOptions,
  Config,
  ServerInfo,
} from 'apollo-server-core';

export * from './exports';

export class ApolloServer extends ApolloServerBase<express.Request> {
  // here we overwrite the underlying listen to configure
  // the fallback / default server implementation
  async listen(
    opts: ListenOptions & {
      onHealthCheck?: (req: express.Request) => Promise<any>;
      disableHealthCheck?: boolean;
      bodyParserConfig?: OptionsJson;
    } = {},
  ): Promise<ServerInfo> {
    //defensive copy
    const { onHealthCheck } = opts;

    // we haven't configured a server yet so lets build the default one
    // using express
    if (!this.getHttp) {
      const app = express();

      if (!opts.disableHealthCheck) {
        //uses same path as engine
        app.use('/.well-known/apollo/server-health', (req, res, next) => {
          //Response follows https://tools.ietf.org/html/draft-inadarei-api-health-check-01
          res.type('application/health+json');

          if (onHealthCheck) {
            onHealthCheck(req)
              .then(() => {
                res.json({ status: 'pass' });
              })
              .catch(() => {
                res.status(503).json({ status: 'fail' });
              });
          } else {
            res.json({ status: 'pass' });
          }
        });
      }

      await registerServer({ app, path: '/', server: this });
    }

    return super.listen(opts);
  }
}
