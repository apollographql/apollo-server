import {
  ApolloServerStandaloneOptions,
  ApolloServerStandalone,
} from '../../standalone';
import { expressMiddleware } from '../../express';
import type { BaseContext } from '../../externalTypes';
import type {
  CreateServerForIntegrationTestsOptions,
  CreateServerForIntegrationTestsResult,
} from '../integration';
import { defineIntegrationTestSuite } from '../integration';

defineIntegrationTestSuite(async function (
  serverOptions: ApolloServerStandaloneOptions<BaseContext>,
  testOptions?: CreateServerForIntegrationTestsOptions,
): Promise<CreateServerForIntegrationTestsResult> {
  const server = new ApolloServerStandalone(serverOptions);
  if (!testOptions?.suppressStartCall) {
    await server.start();
  }

  await server.listen({ port: 0 });

  await new Promise((resolve) => {
    httpServer.once('listening', resolve);
    httpServer.listen({ port: 0 });
  });
  return { server, httpServer };
});
