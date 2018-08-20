import { ApolloServer } from './ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';
import 'mocha';
import { IncomingMessage, ServerResponse } from 'http';

const createCloudFunction = (options: CreateAppOptions = {}) => {
  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );

  const handler = server.createHandler();

  return (req: IncomingMessage, res: ServerResponse) => {
    // return 404 if path is /bogus-route to pass the test, lambda doesn't have paths
    if (req.url.includes('/bogus-route')) {
      res.statusCode = 404;
      return res.end();
    }

    return handler(req, res);
  };
};

describe('integration:CloudFunction', () => {
  testSuite(createCloudFunction);
});
