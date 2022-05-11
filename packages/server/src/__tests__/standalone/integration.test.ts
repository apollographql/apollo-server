import { httpServer as getHttpServer } from '../../standalone';
import type { BaseContext } from '../../externalTypes';
import type {
  CreateServerForIntegrationTestsOptions,
  CreateServerForIntegrationTestsResult,
} from '../integration';
import { defineIntegrationTestSuite } from '../integration';
import type { ApolloServerOptions } from '../../types';
import { ApolloServer } from '../../ApolloServer';
import { Stopper } from '../../plugin/drainHttpServer/stoppable';

defineIntegrationTestSuite(async function (
  serverOptions: ApolloServerOptions<BaseContext>,
  testOptions?: CreateServerForIntegrationTestsOptions,
): Promise<CreateServerForIntegrationTestsResult> {
  const server = new ApolloServer(serverOptions);

  const opts = testOptions ? { context: testOptions.context } : undefined;

  const httpServer = getHttpServer(server, opts);
  await httpServer.listen({ port: 0 });
  async function stopHttpServer() {
    await new Stopper(httpServer['httpServer']).stop(0);
  }

  return { server, httpServer: httpServer['httpServer'], stopHttpServer };
});
