import { expect } from 'chai';
import 'mocha';
import express from 'express';

import http from 'http';

import { RESTDataSource } from 'apollo-datasource-rest';

import { createApolloFetch } from 'apollo-fetch';
import { ApolloServer } from './ApolloServer';

import { createServerInfo } from 'apollo-server-integration-testsuite';

const restPort = 4001;

export class IdAPI extends RESTDataSource {
  baseURL = `http://localhost:${restPort}/`;

  async getId(id: string) {
    console.log(id);
    return this.get(`id/${id}`);
  }

  async getStringId(id: string) {
    console.log(id);
    return this.get(`str/${id}`);
  }
}

//to remove the circular dependency, we reference it directly
const gql = require('../../apollo-server/dist/index').gql;

const typeDefs = gql`
  type Query {
    id: String
    stringId: String
  }
`;

const resolvers = {
  Query: {
    id: async (p, _, { dataSources }) => {
      p = p; //for ts unused locals
      return (await dataSources.id.getId('hi')).id;
    },
    stringId: async (p, _, { dataSources }) => {
      p = p; //for ts unused locals
      return dataSources.id.getStringId('hi');
    },
  },
};

let restCalls = 0;
const restAPI = express();
restAPI.use('/id/:id', (req, res) => {
  const id = req.params.id;
  restCalls++;
  res.header('Cache-Control', 'max-age=2000, public');
  //currently data sources expect that the response be a parsable object
  res.write(JSON.stringify({ id }));
  res.end();
});

//currently data sources expect that the response be an object, so this will fail
restAPI.use('/str/:id', (req, res) => {
  const id = req.params.id;
  restCalls++;
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

  beforeEach(() => {
    restCalls = 0;
  });

  it('uses the cache', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      dataSources: () => ({
        id: new IdAPI(),
      }),
    });
    const app = express();

    server.applyMiddleware({ app });
    const httpServer = await new Promise<http.Server>(resolve => {
      const s = app.listen({ port: 4000 }, () => resolve(s));
    });
    const { url: uri } = createServerInfo(server, httpServer);

    const apolloFetch = createApolloFetch({ uri });
    const firstResult = await apolloFetch({ query: '{id}' });
    console.log(firstResult);

    expect(firstResult.data).to.deep.equal({ id: 'hi' });
    expect(firstResult.errors, 'errors should exist').not.to.exist;
    expect(restCalls).to.deep.equal(1);

    const secondResult = await apolloFetch({ query: '{id}' });

    expect(secondResult.data).to.deep.equal({ id: 'hi' });
    expect(secondResult.errors, 'errors should exist').not.to.exist;
    expect(restCalls).to.deep.equal(1);

    await server.stop();
    await httpServer.close();
  });

  //XXX currently this test fails, since data sources parse json
  // it('can cache a string from the backend', async () => {
  //   const server = new ApolloServer({
  //     typeDefs,
  //     resolvers,
  //     dataSources: () => ({
  //       id: new IdAPI(),
  //     }),
  //   });
  //   const app = express();

  //   server.applyMiddleware({ app });
  //   const httpServer = await new Promise<http.Server>(resolve => {
  //     const s = app.listen({ port: 4000 }, () => resolve(s));
  //   });
  //   const { url: uri } = createServerInfo(server, httpServer);

  //   const apolloFetch = createApolloFetch({ uri });
  //   const firstResult = await apolloFetch({ query: '{stringId}' });
  //   console.log(firstResult);

  //   expect(firstResult.data).to.deep.equal({ id: 'hi' });
  //   expect(firstResult.errors, 'errors should exist').not.to.exist;
  //   expect(restCalls).to.deep.equal(1);

  //   const secondResult = await apolloFetch({ query: '{id}' });

  //   expect(secondResult.data).to.deep.equal({ id: 'hi' });
  //   expect(secondResult.errors, 'errors should exist').not.to.exist;
  //   expect(restCalls).to.deep.equal(1);

  //   await server.stop();
  //   await httpServer.close();
  // });
});
