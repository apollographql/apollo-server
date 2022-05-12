import type http from 'http';
import type { AddressInfo } from 'net';
import { ApolloServer } from '../../ApolloServer';
import type { BaseContext } from '../../externalTypes';
import { standaloneServer } from '../../standalone';
import type { ApolloServerOptions } from '../../types';
import type {
  CreateServerForIntegrationTestsOptions,
  CreateServerForIntegrationTestsResult
} from '../integration';
import { defineIntegrationTestSuite } from '../integration';

defineIntegrationTestSuite(async function (
  serverOptions: ApolloServerOptions<BaseContext>,
  testOptions?: CreateServerForIntegrationTestsOptions,
): Promise<CreateServerForIntegrationTestsResult> {
  const opts = testOptions ? { context: testOptions.context } : undefined;
  const server = new ApolloServer(serverOptions);
  const standaloneServerInstance = standaloneServer(server, opts);
  await standaloneServerInstance.listen({ port: 0 });

  return { server, url: urlForHttpServer(standaloneServerInstance['httpServer']) };
});

function urlForHttpServer(httpServer: http.Server): string {
  const { address, port } = httpServer.address() as AddressInfo;

  // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
  // corresponding loopback ip. Note that the url field we're setting is
  // primarily for consumption by our test suite. If this heuristic is wrong for
  // your use case, explicitly specify a frontend host (in the `host` option to
  // ApolloServer.listen).
  const hostname = address === '' || address === '::' ? 'localhost' : address;

  return `http://${hostname}:${port}`;
}
