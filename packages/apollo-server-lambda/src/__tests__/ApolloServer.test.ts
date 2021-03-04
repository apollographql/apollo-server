import request from 'supertest';
import {createMockServer} from './mockServer';
import { gql } from 'apollo-server-core';
import {
  ApolloServer,
  CreateHandlerOptions
} from '../ApolloServer';

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'hi',
  },
};

describe('apollo-server-lambda', () => {
  const createLambda = (
    options: Partial<CreateHandlerOptions> = {},
  ) => {
    const server = new ApolloServer({
      typeDefs,
      resolvers
    });
    const handler = server.createHandler(options);
    return createMockServer(handler);
  }

  describe('healthchecks', () => {

    it('creates a healthcheck endpoint', async () => {
      const app = createLambda();

      const req = request(app)
        .get('/.well-known/apollo/server-health');

      return req.then((res: any) => {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ status: 'pass' });
        expect(res.headers['content-type']).toEqual('application/json');
      });
    });

    it('provides a callback for the healthcheck', async () => {
      const app = createLambda({
        onHealthCheck: async () => {
          return new Promise((resolve) => {
            return resolve("Success!");
          });
        }
      });

      const req = request(app)
        .get('/.well-known/apollo/server-health');

      return req.then((res: any) => {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ status: 'pass' });
        expect(res.headers['content-type']).toEqual('application/json');
      });
    });

    it('returns a 503 if healthcheck fails', async () => {
      const app = createLambda({
        onHealthCheck: async () => {
          return new Promise(() => {
            throw new Error("Failed to connect!");
          });
        }
      });

      const req = request(app)
        .get('/.well-known/apollo/server-health');

      return req.then((res: any) => {
        expect(res.status).toEqual(503);
        expect(res.body).toEqual({ status: 'fail' });
        expect(res.headers['content-type']).toEqual('application/json');
      });
    });
  });

});
