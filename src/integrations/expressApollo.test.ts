// TODO use import, not require... help appreciated.
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { graphqlHTTP, renderGraphiQL } from './expressApollo';

import testSuite, { CreateAppOptions } from './integrations.test';

function createApp(options: CreateAppOptions = {}) {
  const app = express();
  if (!options.excludeParser) {
    app.use('/graphql', bodyParser.json());
  }
  if (options.graphiqlOptions ) {
    app.use('/graphiql', renderGraphiQL( options.graphiqlOptions ));
  }
  app.use('/graphql', graphqlHTTP( (req) => (options.apolloOptions) ));
  return app;
}

testSuite(createApp);
