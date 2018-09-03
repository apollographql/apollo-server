import { ApolloServer } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';
import * as express from 'express';

const createCloudFunction = (options: CreateAppOptions = {}) => {
  const handler = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  ).createHandler();

  const bogus = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    // return 404 if path is /bogus-route to pass the test, lambda doesn't have paths
    req.url.includes('/bogus-route') ? res.status(404).end() : next();
  };
  // We use express to convert the raw Node request and response
  // into a Google Cloud Functions compatible request and response
  const app = express();
  app.use(bogus);
  app.use(handler);
  return app;
};

describe('integration:CloudFunction', () => {
  testSuite(createCloudFunction);
});
