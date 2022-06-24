import { ApolloServer } from '../..';
import type { ApolloServerOptions, BaseContext } from '../..';
import { startStandaloneServer } from '../../standalone';
import type {
  CreateServerForIntegrationTestsOptions,
  CreateServerForIntegrationTestsResult,
} from '../../testSuite';
import { defineIntegrationTestSuite } from '../../testSuite';

defineIntegrationTestSuite(async function (
  serverOptions: ApolloServerOptions<BaseContext>,
  testOptions?: CreateServerForIntegrationTestsOptions,
): Promise<CreateServerForIntegrationTestsResult> {
  const opts = testOptions ? { context: testOptions.context } : undefined;
  const server = new ApolloServer(serverOptions);
  const { url } = await startStandaloneServer(server, {
    ...opts,
    listen: { port: 0 },
  });

  return {
    server,
    url,
  };
});
