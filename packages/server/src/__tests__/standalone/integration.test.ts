import { httpServer as getHttpServer } from '../../standalone';
import type { BaseContext } from '../../externalTypes';
import type {
  CreateServerForIntegrationTestsResult,
} from '../integration';
import { defineIntegrationTestSuite } from '../integration';
import type { ApolloServerOptions } from '../../types';
import { ApolloServer } from '../../ApolloServer';

defineIntegrationTestSuite(async function (
  serverOptions: ApolloServerOptions<BaseContext>
): Promise<CreateServerForIntegrationTestsResult> {
  const server = new ApolloServer(serverOptions);
  const httpServer = getHttpServer(server);
  await httpServer.listen({ port: 0 });

  return { server, httpServer: httpServer['httpServer'] };
});
