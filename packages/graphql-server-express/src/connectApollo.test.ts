import * as connect from 'connect';
import * as bodyParser from 'body-parser';
import { graphqlConnect, graphiqlConnect } from './connectApollo';
import 'mocha';

import testSuite, { Schema, CreateAppOptions } from 'graphql-server-integration-testsuite';

function createConnectApp(options: CreateAppOptions = {}) {
  const app = connect();

  options.apolloOptions = options.apolloOptions || { schema: Schema };
  if (!options.excludeParser) {
    app.use('/graphql', bodyParser.json());
  }
  if (options.graphiqlOptions ) {
    app.use('/graphiql', graphiqlConnect( options.graphiqlOptions ));
  }
  app.use('/graphql', graphqlConnect( options.apolloOptions ));
  return app;
}

describe('integration:Connect', () => {
  testSuite(createConnectApp);
});
