import http, { Server } from 'http';

import { RESTDataSource } from 'apollo-datasource-rest';

import { createApolloFetch } from 'apollo-fetch';

import {
  NODE_MAJOR_VERSION,
  createServerInfo,
} from 'apollo-server-integration-testsuite';

import { gql } from 'apollo-server-core';

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

// If we're on Node.js v6, skip this test, since `koa-bodyparser` has dropped
// support for it and there was an important update to it which we brought in
// through https://github.com/apollographql/apollo-server/pull/3229.
// It's worth noting that Node.js v6 has been out of Long-Term-Support status
// for four months and is no longer recommended by the Node.js Foundation.
(
  NODE_MAJOR_VERSION === 6 ?
  describe.skip :
  describe
)('apollo-server-koa', () => {
  const { ApolloServer } = require('../ApolloServer');
  const Koa = require('koa');
  const KoaRouter = require('koa-router');

  let restCalls = 0;
  const restAPI = new Koa();
  const router = new KoaRouter();
  router.all('/id/:id', ctx => {
    const id = ctx.params.id;
    restCalls++;
    ctx.set('Cache-Control', 'max-age=2000, public');
    ctx.body = { id };
  });

  router.all('/str/:id', ctx => {
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
    restUrl = await new Promise(resolve => {
      restServer = restAPI.listen(0, () => {
        const { port } = restServer.address();
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
        id: new class extends IdAPI {
          baseURL = restUrl;
        },
      }),
    });
    const app = new Koa();

    server.applyMiddleware({ app });
    httpServer = await new Promise<http.Server>(resolve => {
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
        id: new class extends IdAPI {
          baseURL = restUrl;
        },
      }),
    });
    const app = new Koa();

    server.applyMiddleware({ app });
    httpServer = await new Promise<http.Server>(resolve => {
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
