import { ApolloServer } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';
import express = require('express');
import bodyParser = require('body-parser');

const createCloudFunction = (options: CreateAppOptions = {}) => {
  const handler = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  ).createHandler();

  // We use Express to simulate the Google Cloud
  // Function like environment
  const app = express();
  app.use(bodyParser.json());
  app.use(handler);
  return app;
};

describe('integration:CloudFunction', () => {
  testSuite(createCloudFunction);
});
