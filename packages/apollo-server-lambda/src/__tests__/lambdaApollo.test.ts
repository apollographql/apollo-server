import { ApolloServer } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import type { Config } from 'apollo-server-core';
import {
  createAPIGatewayV1MockServer,
  createAPIGatewayV2MockServer,
} from './mockAPIGatewayServer';
import { createMockServer as createALBMockServer } from './mockALBServer';

const serverHandler = (options: CreateAppOptions = {}) => {
  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );

  return server.createHandler();
};

const createAPIGatewayV1Lambda = async (options: CreateAppOptions = {}) => {
  return createAPIGatewayV1MockServer(serverHandler(options));
};

const createAPIGatewayV2Lambda = async (options: CreateAppOptions = {}) => {
  return createAPIGatewayV2MockServer(serverHandler(options));
};

const createALBLambda = async (options: CreateAppOptions = {}) => {
  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );

  const handler = server.createHandler();

  return createALBMockServer(handler);
};

describe('integration:APIGatewayV2:Lambda', () => {
  testSuite({ createApp: createAPIGatewayV2Lambda, serverlessFramework: true });
});

describe('integration:APIGatewayV1:Lambda', () => {
  testSuite({ createApp: createAPIGatewayV1Lambda, serverlessFramework: true });
});

describe('integration:ALB:Lambda', () => {
  testSuite({ createApp: createALBLambda, serverlessFramework: true });
});
