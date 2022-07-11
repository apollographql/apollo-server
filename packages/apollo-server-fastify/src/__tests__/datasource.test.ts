import Fastify, { FastifyInstance } from 'fastify';

import { RESTDataSource } from 'apollo-datasource-rest';

import { ApolloServer } from '../ApolloServer';

import {
  createServerInfo,
  createApolloFetch,
} from 'apollo-server-integration-testsuite';
import { gql } from '../index';

const restPort = 4003;

export class IdAPI extends RESTDataSource {
  override baseURL = `http://localhost:${restPort}/`;

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
    id: async (_source: any, _args: any, { dataSources }: any) => {
      return (await dataSources.id.getId('hi')).id;
    },
    stringId: async (_source: any, _args: any, { dataSources }: any) => {
      return dataSources.id.getStringId('hi');
    },
  },
};

interface Route {
  Params: {
    id: string,
  },
}

let restCalls = 0;
const restAPI = Fastify();

restAPI.get<Route>('/id/:id', (request, reply) => {
  const id = request.params.id;
  restCalls++;
  reply.header('Content-Type', 'application/json');
  reply.header('Cache-Control', 'max-age=2000, public');
  reply.send({ id });
});

restAPI.get<Route>('/str/:id', (request, reply) => {
  const id = request.params.id;
  restCalls++;
  reply.header('Content-Type', 'text/plain');
  reply.header('Cache-Control', 'max-age=2000, public');
  reply.send(id);
});

describe('apollo-server-fastify', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    await restAPI.listen({ port: restPort });
  });

  afterAll(async () => {
    await new Promise<void>(resolve => restAPI.close(() => resolve()));
  });

  let server: ApolloServer;

  beforeEach(() => {
    restCalls = 0;
  });

  afterEach(async () => {
    await server.stop();
    await new Promise<void>(resolve => fastify.close(() => resolve()));
  });

  it('uses the cache', async () => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      dataSources: () => ({
        id: new IdAPI(),
      }),
    });
    await server.start();

    fastify = Fastify();

    fastify.register(server.plugin);
    await fastify.listen({ port: 0 });

    const { url: uri } = createServerInfo(server, fastify.server);

    const apolloFetch = createApolloFetch({ uri });
    const firstResult = await apolloFetch({ query: '{ id }' });

    expect(firstResult.data).toEqual({ id: 'hi' });
    expect(firstResult.errors).toBeUndefined();
    expect(restCalls).toEqual(1);

    const secondResult = await apolloFetch({ query: '{ id }' });

    expect(secondResult.data).toEqual({ id: 'hi' });
    expect(secondResult.errors).toBeUndefined();
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

    await server.start();

    fastify = Fastify();

    fastify.register(server.plugin);
    await fastify.listen({ port: 0 });
    const { url: uri } = createServerInfo(server, fastify.server);

    const apolloFetch = createApolloFetch({ uri });
    const firstResult = await apolloFetch({ query: '{ id: stringId }' });

    expect(firstResult.data).toEqual({ id: 'hi' });
    expect(firstResult.errors).toBeUndefined();
    expect(restCalls).toEqual(1);

    const secondResult = await apolloFetch({ query: '{ id: stringId }' });

    expect(secondResult.data).toEqual({ id: 'hi' });
    expect(secondResult.errors).toBeUndefined();
    expect(restCalls).toEqual(1);
  });
});
