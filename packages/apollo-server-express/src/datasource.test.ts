import { expect } from 'chai';
import 'mocha';
import * as express from 'express';

import * as http from 'http';

import { RESTDataSource } from 'apollo-datasource-rest';

import { createApolloFetch } from 'apollo-fetch';
import { ApolloServer } from './ApolloServer';

import { createServerInfo } from 'apollo-server-integration-testsuite';

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

// to remove the circular dependency, we reference it directly
const gql = require('../../apollo-server/dist/index').gql;

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

  before(async () => {
    await new Promise(resolve => {
      restServer = restAPI.listen(restPort, resolve);
    });
  });

  after(async () => {
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
      const s = app.listen({ port: 4000 }, () => resolve(s));
    });
    const { url: uri } = createServerInfo(server, httpServer);

    const apolloFetch = createApolloFetch({ uri });
    const firstResult = await apolloFetch({ query: '{ id }' });

    expect(firstResult.data).to.deep.equal({ id: 'hi' });
    expect(firstResult.errors, 'errors should exist').not.to.exist;
    expect(restCalls).to.deep.equal(1);

    const secondResult = await apolloFetch({ query: '{ id }' });

    expect(secondResult.data).to.deep.equal({ id: 'hi' });
    expect(secondResult.errors, 'errors should exist').not.to.exist;
    expect(restCalls).to.deep.equal(1);
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
      const s = app.listen({ port: 4000 }, () => resolve(s));
    });
    const { url: uri } = createServerInfo(server, httpServer);

    const apolloFetch = createApolloFetch({ uri });
    const firstResult = await apolloFetch({ query: '{ id: stringId }' });

    expect(firstResult.data).to.deep.equal({ id: 'hi' });
    expect(firstResult.errors, 'errors should exist').not.to.exist;
    expect(restCalls).to.deep.equal(1);

    const secondResult = await apolloFetch({ query: '{ id: stringId }' });

    expect(secondResult.data).to.deep.equal({ id: 'hi' });
    expect(secondResult.errors, 'errors should exist').not.to.exist;
    expect(restCalls).to.deep.equal(1);
  });
});
