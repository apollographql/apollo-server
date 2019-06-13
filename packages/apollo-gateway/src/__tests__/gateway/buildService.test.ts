import gql from 'graphql-tag';
import { print } from 'graphql';
import { fetch } from '__mocks__/apollo-server-env';
import { createTestClient } from 'apollo-server-testing';
import { ApolloServerBase as ApolloServer } from 'apollo-server-core';
import { buildFederatedSchema } from '@apollo/federation';

import { RemoteGraphQLDataSource } from '../../datasources/RemoteGraphQLDatasource';
import { ApolloGateway } from '../../';

import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

beforeEach(() => {
  fetch.mockReset();
});

it('correctly passes the context from ApolloServer to datasources', async () => {
  const gateway = new ApolloGateway({
    localServiceList: [accounts, books, inventory, product, reviews],
    buildService: service => {
      return new RemoteGraphQLDataSource({
        url: 'https://api.example.com/foo',
        willSendRequest: ({ request, context }) => {
          request.http.headers.set('x-user-id', context.userId);
        },
      });
    },
  });

  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({
    schema,
    executor,
    context: () => ({
      userId: '1234',
    }),
  });

  const call = createTestClient(server);

  const query = gql`
    {
      me {
        username
      }
    }
  `;

  fetch.mockJSONResponseOnce({ data: { me: { username: '@jbaxleyiii' } } });

  const result = await call.query({
    query,
  });

  expect(result.errors).toBeUndefined();
  expect(result.data).toEqual({
    me: { username: '@jbaxleyiii' },
  });

  expect(fetch).toBeCalledTimes(1);
  expect(fetch).toHaveFetched({
    url: 'https://api.example.com/foo',
    body: {
      query: `{
  me {
    username
  }
}`,
      variables: {},
    },
    headers: {
      'x-user-id': '1234',
    },
  });
});
