import http, { Server } from 'http';

import { RESTDataSource } from 'apollo-datasource-rest';

import {
  createServerInfo,
  createApolloFetch,
} from 'apollo-server-integration-testsuite';

import { gql } from 'apollo-server-core';
import type { GraphQLResolverMap } from 'apollo-graphql';
import { AddressInfo } from 'net';

export class IdAPI extends RESTDataSource {
  // We will set this inside tests.
  // baseURL = `http://localhost:${restPort}/`;

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

const resolvers: GraphQLResolverMap<{ dataSources: { id: IdAPI } }> = {
  Query: {
    id: async (_source, _args, { dataSources }) => {
      return (await dataSources.id.getId('hi')).id;
    },
    stringId: async (_source, _args, { dataSources }) => {
      return dataSources.id.getStringId('hi');
    },
  },
};

describe('apollo-server-koa', () => {
  const { ApolloServer } = require('../ApolloServer');
  const Koa = require('koa');
  const KoaRouter = require('koa-router');

  let restCalls = 0;
  const restAPI = new Koa();
  const router = new KoaRouter();
  router.all('/id/:id', (ctx: any) => {
    const id = ctx.params.id;
    restCalls++;
    ctx.set('Cache-Control', 'max-age=2000, public');
    ctx.body = { id };
  });

  router.all('/str/:id', (ctx: any) => {
    const id = ctx.params.id;
    restCalls++;
    ctx.set('Cache-Control', 'max-age=2000, public');
    ctx.body = id;
  });

  restAPI.use(router.routes());
  restAPI.use(router.allowedMethods());

  let restServer: Server;
  let restUrl: string;

  beforeAll(async () => {
    restUrl = await new Promise((resolve) => {
      restServer = restAPI.listen(0, () => {
        const { port } = restServer.address() as AddressInfo;
        resolve(`http://localhost:${port}`);
      });
    });
  });

  afterAll(async () => {
    await restServer.close();
  });

  let server: import('../ApolloServer').ApolloServer;
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
        id: new (class extends IdAPI {
          override baseURL = restUrl;
        })(),
      }),
    });
    await server.start();
    const app = new Koa();

    server.applyMiddleware({ app });
    httpServer = await new Promise<http.Server>((resolve) => {
      const s = app.listen({ port: 0 }, () => resolve(s));
    });
    const { url: uri } = createServerInfo(server, httpServer);

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
        id: new (class extends IdAPI {
          override baseURL = restUrl;
        })(),
      }),
    });
    await server.start();
    const app = new Koa();

    server.applyMiddleware({ app });
    httpServer = await new Promise<http.Server>((resolve) => {
      const s = app.listen({ port: 0 }, () => resolve(s));
    });
    const { url: uri } = createServerInfo(server, httpServer);

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
