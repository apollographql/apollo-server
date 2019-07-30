import gql from 'graphql-tag';
import { execute, printPlan } from '../execution-utils';

import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

// FIXME: remove this when GraphQLExtensions is removed
import { createTestClient } from 'apollo-server-testing';
import { ApolloServerBase as ApolloServer } from 'apollo-server-core';
import { buildFederatedSchema } from '@apollo/federation';
import { LocalGraphQLDataSource } from '../../datasources/LocalGraphQLDataSource';
import { ApolloGateway } from '../../';

it('supports simple aliases', async () => {
  const query = gql`
    query GetProduct($upc: String!) {
      product(upc: $upc) {
        name
        title: name
      }
    }
  `;

  const upc = '1';
  const { data, errors, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables: { upc },
    },
  );

  expect(data).toEqual({
    product: {
      name: 'Table',
      title: 'Table',
    },
  });

  expect(queryPlan).toCallService('product');
});

it('supports aliases of root fields on subservices', async () => {
  const query = gql`
    query GetProduct($upc: String!) {
      product(upc: $upc) {
        name
        title: name
        reviews {
          body
        }
        productReviews: reviews {
          body
        }
      }
    }
  `;

  const upc = '1';
  const { data, errors, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables: { upc },
    },
  );

  expect(data).toEqual({
    product: {
      name: 'Table',
      title: 'Table',
      reviews: [
        {
          body: 'Love it!',
        },
        {
          body: 'Prefer something else.',
        },
      ],
      productReviews: [
        {
          body: 'Love it!',
        },
        {
          body: 'Prefer something else.',
        },
      ],
    },
  });

  expect(queryPlan).toCallService('product');
});

it('supports aliases of nested fields on subservices', async () => {
  const query = gql`
    query GetProduct($upc: String!) {
      product(upc: $upc) {
        name
        title: name
        reviews {
          content: body
          body
        }
        productReviews: reviews {
          body
          reviewer: author {
            name: username
          }
        }
      }
    }
  `;

  const upc = '1';
  const { data, errors, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables: { upc },
    },
  );

  expect(data).toEqual({
    product: {
      name: 'Table',
      title: 'Table',
      reviews: [
        {
          content: 'Love it!',
          body: 'Love it!',
        },
        {
          content: 'Prefer something else.',
          body: 'Prefer something else.',
        },
      ],
      productReviews: [
        {
          body: 'Love it!',
          reviewer: {
            name: '@ada',
          },
        },
        {
          body: 'Prefer something else.',
          reviewer: {
            name: '@complete',
          },
        },
      ],
    },
  });

  expect(queryPlan).toCallService('product');
});

// TODO after we remove GraphQLExtensions from ApolloServer, this can go away
it('supports aliases when using ApolloServer', async () => {
  const gateway = new ApolloGateway({
    localServiceList: [accounts, books, inventory, product, reviews],
    buildService: service => {
      return new LocalGraphQLDataSource(buildFederatedSchema([service]));
    },
  });

  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({ schema, executor });

  const upc = '1';
  const { query } = createTestClient(server);

  const result = await query({
    query: gql`
      query GetProduct($upc: String!) {
        product(upc: $upc) {
          title: name
        }
      }
    `,
    variables: { upc },
  });

  expect(result.data).toEqual({
    product: {
      title: 'Table',
    },
  });
});
