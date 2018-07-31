import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';

import * as http from 'http';

import { RESTDataSource } from 'apollo-datasource-rest';

import { createApolloFetch } from 'apollo-fetch';
import { ApolloServer } from '../ApolloServer';

import { createServerInfo } from 'apollo-server-integration-testsuite';
import { gql } from '../index';

const restPort = 4002;

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

describe('apollo-server-koa', () => {
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
    const app = new Koa();

    server.applyMiddleware({ app });
    httpServer = await new Promise<http.Server>(resolve => {
      const s = app.listen({ port: 7778 }, () => resolve(s));
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
        id: new IdAPI(),
      }),
    });
    const app = new Koa();

    server.applyMiddleware({ app });
    httpServer = await new Promise<http.Server>(resolve => {
      const s = app.listen({ port: 7779 }, () => resolve(s));
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
