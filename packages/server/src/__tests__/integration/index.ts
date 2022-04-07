import type http from 'http';
import type { BaseContext } from '@apollo/server-types';
import type { ApolloServer, ApolloServerOptions } from '../..';
import { defineIntegrationTestSuiteApolloServerTests } from './apolloServerTests';
import { defineIntegrationTestSuiteHttpServerTests } from './httpServerTests';

export interface CreateServerForIntegrationTestsResult {
  server: ApolloServer<BaseContext>;
  httpServer: http.Server;
}

export interface CreateServerForIntegrationTestsOptions {
  suppressStartCall?: boolean;
  graphqlPath?: string;
  noRequestsMade?: boolean;
  context?: () => Promise<BaseContext>;
}

export type CreateServerForIntegrationTests = (
  config: ApolloServerOptions<BaseContext>,
  options?: CreateServerForIntegrationTestsOptions,
) => Promise<CreateServerForIntegrationTestsResult>;

export function defineIntegrationTestSuite(
  createServer: CreateServerForIntegrationTests,
  options: {
    serverlessFramework?: boolean;
  } = {},
) {
  describe('integration tests', () => {
    defineIntegrationTestSuiteApolloServerTests(createServer, options);
    defineIntegrationTestSuiteHttpServerTests(createServer, options);
  });
}
