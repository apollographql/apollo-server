import { httpServer as getHttpServer } from '../../standalone';
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

  // This test option doesn't apply to the standalone version, this replicates
  // the behavior expected by the integration test suite.
  if (testOptions?.suppressStartCall) {
    throw Error('You must `await server.start()`');
  }

  const server = new ApolloServer(serverOptions);
  const httpServer = getHttpServer(server);

  await httpServer.listen({ port: 0 });

  return { server, httpServer: httpServer['httpServer'] };
});
