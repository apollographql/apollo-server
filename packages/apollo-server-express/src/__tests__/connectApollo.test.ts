import connect from 'connect';
import query from 'qs-middleware';
import { ApolloServer } from '../ApolloServer';
import { Config } from 'apollo-server-core';

import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';

function createConnectApp(options: CreateAppOptions = {}) {
  const app = connect();
  // We do require users of ApolloServer with connect to use a query middleware
  // first. The alternative is to add a 'isConnect' bool to ServerRegistration
  // and make qs-middleware be a dependency of this package. However, we don't
  // think many folks use connect outside of Meteor anyway, and anyone using
  // connect is probably already using connect-query or qs-middleware.
  app.use(query());
  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );
  // See comment on ServerRegistration.app for its typing.
  server.applyMiddleware({ app: app as any });
  return app;
}

describe('integration:Connect', () => {
  testSuite(createConnectApp);
});
