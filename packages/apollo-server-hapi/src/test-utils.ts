import { HttpLink } from 'apollo-link-http';
import { Server } from 'hapi';
import fetch from 'node-fetch';
import { execute } from 'apollo-link';
export { toPromise } from 'apollo-link';

import { ApolloServer } from './';

export const startTestServer = async (server: ApolloServer) => {
  const app = new Server({ host: 'localhost', port: 0 });

  server.applyMiddleware({ app });
  await app.start();

  const port = app.info.port;

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

  return { link, stop: () => app.stop(), graphql: executeOperation };
};
