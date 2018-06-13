import connect from 'connect';
import bodyParser from 'body-parser';
import { graphqlConnect } from './connectApollo';
import 'mocha';

import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';

function createConnectApp(options: CreateAppOptions = {}) {
  const app = connect();

  options.graphqlOptions = options.graphqlOptions || { schema: Schema };
  if (!options.excludeParser) {
    app.use('/graphql', bodyParser.json());
  }
  app.use('/graphql', require('connect-query')());
  app.use('/graphql', graphqlConnect(options.graphqlOptions));
  return app;
}

describe('integration:Connect', () => {
  testSuite(createConnectApp);
});
