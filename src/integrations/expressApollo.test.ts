import * as express from 'express';
import * as bodyParser from 'body-parser';
import { apolloExpress, graphiqlExpress } from './expressApollo';
import testSuite, { Schema, CreateAppOptions } from './integrations.test';

function createApp(options: CreateAppOptions = {}) {
  const app = express();

  options.apolloOptions = options.apolloOptions || { schema: Schema };
  if (!options.excludeParser) {
    app.use('/graphql', bodyParser.json());
  }
  if (options.graphiqlOptions ) {
    app.use('/graphiql', graphiqlExpress( options.graphiqlOptions ));
  }
  app.use('/graphql', apolloExpress( options.apolloOptions ));
  return app;
}

describe('integration:Express', () => {
  testSuite(createApp);
});
