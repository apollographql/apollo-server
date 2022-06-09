import type {
  ApolloServer,
  ApolloServerOptions,
  BaseContext,
  ContextThunk,
} from '../..';
import { defineIntegrationTestSuiteApolloServerTests } from './apolloServerTests';
import { defineIntegrationTestSuiteHttpServerTests } from './httpServerTests';

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
  } = {},
) {
  describe('integration tests', () => {
    defineIntegrationTestSuiteApolloServerTests(createServer, options);
    defineIntegrationTestSuiteHttpServerTests(createServer, options);
  });
}
