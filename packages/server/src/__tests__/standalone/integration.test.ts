import { standaloneServer } from '../../standalone';
import type { BaseContext } from '../../externalTypes';
import type {
  CreateServerForIntegrationTestsOptions,
  CreateServerForIntegrationTestsResult,
} from '../integration';
import { defineIntegrationTestSuite } from '../integration';
import type { ApolloServerOptions } from '../../types';
import { ApolloServer } from '../../ApolloServer';

defineIntegrationTestSuite(async function (
  serverOptions: ApolloServerOptions<BaseContext>,
  testOptions?: CreateServerForIntegrationTestsOptions,
): Promise<CreateServerForIntegrationTestsResult> {
  const opts = testOptions ? { context: testOptions.context } : undefined;
  const server = new ApolloServer(serverOptions);
  const standaloneServerInstance = standaloneServer(server, opts);
  await standaloneServerInstance.listen({ port: 0 });

  return { server, httpServer: standaloneServerInstance['httpServer'] };
});
