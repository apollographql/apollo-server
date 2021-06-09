import { ApolloServer } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';
import { createMockServer as createAPIGatewayMockServer } from './mockAPIGatewayServer';
import { createMockServer as createALBMockServer } from './mockALBServer';

const createAPIGatewayLambda = async (options: CreateAppOptions = {}) => {
  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );

  const handler = server.createHandler();

  return createAPIGatewayMockServer(handler);
};

const createALBLambda = async (options: CreateAppOptions = {}) => {
  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );

  const handler = server.createHandler();

  return createALBMockServer(handler);
};

describe('integration:APIGateway:Lambda', () => {
  testSuite({ createApp: createAPIGatewayLambda, serverlessFramework: true });
});

describe('integration:ALB:Lambda', () => {
  testSuite({ createApp: createALBLambda, serverlessFramework: true });
});
