import MockReq = require('mock-req');

import { ApolloServerBase } from '../ApolloServer';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  fields: {
    testString: {
      type: GraphQLString,
      resolve() {
        return 'it works';
      },
    },
  },
});

describe('ApolloServer', () => {
  describe('executeOperation', () => {
    it('Passes the request object to the context callback', () => {
      const schema = new GraphQLSchema({
        query: queryType,
      });
      const contextMock = jest.fn();
      const apolloServer = new ApolloServerBase({
        schema,
        context: contextMock,
      });
      const mockRequest = new MockReq();
      const operation = {
        query: '{ }',
        http: mockRequest,
      };

      apolloServer.executeOperation(operation);

      expect(contextMock).toHaveBeenCalledWith({ req: operation });
    });
  });
});
