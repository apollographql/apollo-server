import { ApolloServer } from '../../ApolloServer';
import type { BaseContext } from '../../externalTypes';
import { standaloneServer } from '../../standalone';
import type { ApolloServerOptions } from '../../types';
import { urlForHttpServer } from '../../utils/urlForHttpServer';
import type {
  CreateServerForIntegrationTestsOptions,
  CreateServerForIntegrationTestsResult,
} from '../integration';
import { defineIntegrationTestSuite } from '../integration';

defineIntegrationTestSuite(async function (
  serverOptions: ApolloServerOptions<BaseContext>,
  testOptions?: CreateServerForIntegrationTestsOptions,
): Promise<CreateServerForIntegrationTestsResult> {
  const opts = testOptions ? { context: testOptions.context } : undefined;
  const server = new ApolloServer(serverOptions);
  const { url } = await standaloneServer(server, opts, { port: 0 });

  return {
    server,
    url,
  };
});
