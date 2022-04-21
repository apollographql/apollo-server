import type http from 'http';
import type { BaseContext } from '../../externalTypes';
import type { ApolloServer, ApolloServerOptions } from '../..';
import { defineIntegrationTestSuiteApolloServerTests } from './apolloServerTests';
import { defineIntegrationTestSuiteHttpServerTests } from './httpServerTests';
import type { ContextThunk } from '../../ApolloServer';

export interface CreateServerForIntegrationTestsResult {
  server: ApolloServer<BaseContext>;
  httpServer: http.Server;
}

export interface CreateServerForIntegrationTestsOptions {
  suppressStartCall?: boolean;
  graphqlPath?: string;
  noRequestsMade?: boolean;
  context?: ContextThunk;
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
