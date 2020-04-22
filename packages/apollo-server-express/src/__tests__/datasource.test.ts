import express from 'express';

import http from 'http';

import { RESTDataSource } from 'apollo-datasource-rest';

import { createApolloFetch } from 'apollo-fetch';
import { ApolloServer } from '../ApolloServer';

import { createServerInfo } from 'apollo-server-integration-testsuite';
import { gql } from '../index';

const restPort = 4001;

export class IdAPI extends RESTDataSource {
  baseURL = `http://localhost:${restPort}/`;

  async getId(id: string) {
    return this.get(`id/${id}`);
  }

  async getStringId(id: string) {
    return this.get(`str/${id}`);
  }
}

const typeDefs = gql`
  type Query {
    id: String
    stringId: String
  }
`;

const resolvers = {
  Query: {
    id: async (_source, _args, { dataSources }) => {
      return (await dataSources.id.getId('hi')).id;
    },
    stringId: async (_source, _args, { dataSources }) => {
      return dataSources.id.getStringId('hi');
    },
  },
};

let restCalls = 0;
const restAPI = express();
restAPI.use('/id/:id', (req, res) => {
  const id = req.params.id;
  restCalls++;
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', 'max-age=2000, public');
  res.write(JSON.stringify({ id }));
  res.end();
});

restAPI.use('/str/:id', (req, res) => {
  const id = req.params.id;
  restCalls++;
  res.header('Content-Type', 'text/plain');
  res.header('Cache-Control', 'max-age=2000, public');
  res.write(id);
  res.end();
});

describe('apollo-server-express', () => {
  let restServer;

  beforeAll(async () => {
    await new Promise(resolve => {
      restServer = restAPI.listen(restPort, resolve);
    });
  });

  afterAll(async () => {
    await restServer.close();
  });

  let server: ApolloServer;
  let httpServer: http.Server;

  beforeEach(() => {
    restCalls = 0;
  });

  afterEach(async () => {
    await server.stop();
    await httpServer.close();
  });

  it('uses the cache', async () => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      dataSources: () => ({
        id: new IdAPI(),
      }),
    });
    const app = express();

    server.applyMiddleware({ app });
    httpServer = await new Promise<http.Server>(resolve => {
      const s = app.listen({ port: 0 }, () => resolve(s));
    });
    const { url: uri } = createServerInfo(server, httpServer);

    const apolloFetch = createApolloFetch({ uri });
    const firstResult = await apolloFetch({ query: '{ id }' });

    expect(firstResult.errors).toBeUndefined();
    expect(firstResult.data).toEqual({ id: 'hi' });
    expect(restCalls).toEqual(1);

    const secondResult = await apolloFetch({ query: '{ id }' });

    expect(secondResult.errors).toBeUndefined();
    expect(secondResult.data).toEqual({ id: 'hi' });
    expect(restCalls).toEqual(1);
  });

  it('can cache a string from the backend', async () => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      dataSources: () => ({
        id: new IdAPI(),
      }),
    });
    const app = express();

    server.applyMiddleware({ app });
    httpServer = await new Promise<http.Server>(resolve => {
      const s = app.listen({ port: 0 }, () => resolve(s));
    });
    const { url: uri } = createServerInfo(server, httpServer);

    const apolloFetch = createApolloFetch({ uri });
    const firstResult = await apolloFetch({ query: '{ id: stringId }' });

    expect(firstResult.errors).toBeUndefined();
    expect(firstResult.data).toEqual({ id: 'hi' });
    expect(restCalls).toEqual(1);

    const secondResult = await apolloFetch({ query: '{ id: stringId }' });

    expect(secondResult.errors).toBeUndefined();
    expect(secondResult.data).toEqual({ id: 'hi' });
    expect(restCalls).toEqual(1);
  });
});
