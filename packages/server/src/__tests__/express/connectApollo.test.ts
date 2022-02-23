import connect from 'connect';
import query from 'qs-middleware';
import { ApolloServerExpress, ApolloServerExpressConfig } from '../../express';

import testSuite, { schema as Schema, CreateAppOptions } from '../integration';

async function createConnectApp(options: CreateAppOptions = {}) {
  const app = connect();
  // We do require users of ApolloServer with connect to use a query middleware
  // first. The alternative is to add a 'isConnect' bool to ServerRegistration
  // and make qs-middleware be a dependency of this package. However, we don't
  // think many folks use connect outside of Meteor anyway, and anyone using
  // connect is probably already using connect-query or qs-middleware.
  app.use(query() as any);
  const server = new ApolloServerExpress(
    (options.graphqlOptions as ApolloServerExpressConfig) || { schema: Schema },
  );
  await server.start();
  // See comment on ServerRegistration.app for its typing.
  (app as any).use('/graphql', server.getMiddleware());
  return app;
}

describe('integration:Connect', () => {
  testSuite({ createApp: createConnectApp });
});
