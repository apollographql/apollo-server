import type http from 'http';
import type { ApolloServer, ApolloServerOptions } from '../..';
import type { ContextThunk } from '../../ApolloServer';
import type { BaseContext } from '../../externalTypes';
import { defineIntegrationTestSuiteApolloServerTests } from './apolloServerTests';
import { defineIntegrationTestSuiteHttpServerTests } from './httpServerTests';

export interface CreateServerForIntegrationTestsResult {
  server: ApolloServer<BaseContext>;
  httpServer: http.Server;
  stopHttpServer?: () => Promise<void>;
}

export interface CreateServerForIntegrationTestsOptions {
  suppressStartCall?: boolean;
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
