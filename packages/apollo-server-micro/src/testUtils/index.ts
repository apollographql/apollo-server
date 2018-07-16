import { HttpLink } from 'apollo-link-http';
import micro from 'micro';
import fetch from 'node-fetch';
import { execute } from 'apollo-link';
export { toPromise } from 'apollo-link';

import { ApolloServer } from '../';

export const startTestServer = async (server: ApolloServer) => {
  const app = micro(server.createHandler());
  const httpServer = await app.listen();

  const port = httpServer.address().port;

  const link = new HttpLink({
    uri: `http://localhost:${port}/graphql`,
    fetch,
  });

  const executeOperation = ({
    query,
    variables = {},
  }: {
    query: any;
    variables: Record<string, any>;
  }) => execute(link, { query, variables });

  return { link, stop: () => app.close(), graphql: executeOperation };
};
