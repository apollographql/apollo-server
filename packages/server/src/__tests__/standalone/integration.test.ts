import { ApolloServer } from '../..';
import { startStandaloneServer } from '../../standalone';
import { defineIntegrationTestSuite } from '@apollo/server-integration-testsuite';

defineIntegrationTestSuite(async function (serverOptions, testOptions) {
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
