import type {
  ApolloServer,
  ApolloServerOptions,
  BaseContext,
  ContextThunk,
} from '@apollo/server';
import { describe } from '@jest/globals';
import { defineIntegrationTestSuiteApolloServerTests } from './apolloServerTests.js';
import { defineIntegrationTestSuiteHttpServerTests } from './httpServerTests.js';
import { defineIntegrationTestSuiteHttpSpecTests } from './httpSpecTests.js';

export interface CreateServerForIntegrationTestsResult {
  server: ApolloServer<BaseContext>;
  url: string;
  extraCleanup?: () => Promise<void>;
}

export interface CreateServerForIntegrationTestsOptions {
  context?: ContextThunk;
}

export type CreateServerForIntegrationTests = (
  config: ApolloServerOptions<BaseContext>,
  options?: CreateServerForIntegrationTestsOptions,
) => Promise<CreateServerForIntegrationTestsResult>;

export function defineIntegrationTestSuite(
  createServer: CreateServerForIntegrationTests,
  options: {
    serverIsStartedInBackground?: boolean;
    noIncrementalDelivery?: boolean;
  } = {},
) {
  describe('integration tests', () => {
    defineIntegrationTestSuiteApolloServerTests(createServer, options);
    defineIntegrationTestSuiteHttpServerTests(createServer, options);
    defineIntegrationTestSuiteHttpSpecTests(createServer);
  });
}
