import * as express from 'express';
import { registerServer } from 'apollo-server-express';

import {
  ApolloServerBase,
  ListenOptions,
  Config,
  ServerInfo,
} from 'apollo-server-core';

export * from './exports';

export class ApolloServer extends ApolloServerBase<express.Request> {
  private disableHealthCheck: boolean = false;
  private onHealthCheck: (req: express.Request) => Promise<any>;

  constructor({
    disableHealthCheck,
    onHealthCheck,
    ...opts
  }: Config<express.Request> & {
    onHealthCheck?: (req: express.Request) => Promise<any>;
    disableHealthCheck?: boolean;
  }) {
    super(opts);
    if (disableHealthCheck) this.disableHealthCheck = true;
    this.onHealthCheck = onHealthCheck;
  }

  // here we overwrite the underlying listen to configure
  // the fallback / default server implementation
  async listen(opts: ListenOptions = {}): Promise<ServerInfo> {
    // we haven't configured a server yet so lets build the default one
    // using express
    if (!this.getHttp) {
      const app = express();

      if (!this.disableHealthCheck) {
        //uses same path as engine
        app.use('/.well-known/apollo/server-health', (req, res, next) => {
          //Response follows https://tools.ietf.org/html/draft-inadarei-api-health-check-01
          res.type('application/health+json');

          if (this.onHealthCheck) {
            this.onHealthCheck(req)
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
