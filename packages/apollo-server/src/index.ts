// Note: express is only used if you use the ApolloServer.listen API to create
// an express app for you instead of registerServer (which you might not even
// use with express). The dependency is unused otherwise, so don't worry if
// you're not using express or your version doesn't quite match up.
import express from 'express';
import { registerServer } from 'apollo-server-express';

import {
  ApolloServerBase,
  ListenOptions,
  ServerInfo,
} from 'apollo-server-core';

export { GraphQLOptions, GraphQLExtension, gql } from 'apollo-server-core';
import { GraphQLOptions } from 'apollo-server-core';

export * from './exports';

export class ApolloServer extends ApolloServerBase {
  //This translates the arguments from the middleware into graphQL options It
  //provides typings for the integration specific behavior, ideally this would
  //be propagated with a generic to the super class
  async createGraphQLServerOptions(
    req: express.Request,
    res: express.Response,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req, res });
  }

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
