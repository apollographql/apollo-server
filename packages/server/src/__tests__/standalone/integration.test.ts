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
  // FIXME
  _testOptions?: CreateServerForIntegrationTestsOptions,
): Promise<CreateServerForIntegrationTestsResult> {
  // const server = new ApolloServerStandalone(serverOptions);
  // if (!testOptions?.suppressStartCall) {
  //   await server.start();
  // }
  const server = new ApolloServer(serverOptions);
  const httpServer = getHttpServer(server);

  await httpServer.listen({ port: 0 });

  return { server, httpServer: httpServer['httpServer'] };
});
