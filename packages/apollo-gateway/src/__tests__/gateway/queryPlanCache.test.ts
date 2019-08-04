import gql from 'graphql-tag';
import { createTestClient } from 'apollo-server-testing';
import { ApolloServerBase as ApolloServer } from 'apollo-server-core';
import { buildFederatedSchema } from '@apollo/federation';

import { LocalGraphQLDataSource } from '../../datasources/LocalGraphQLDataSource';
import { ApolloGateway } from '../../';

import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

it('caches the query plan for a request', async () => {
  const planner = require('../../buildQueryPlan');
  const originalPlanner = planner.buildQueryPlan;

  planner.buildQueryPlan = jest.fn(originalPlanner);

  const gateway = new ApolloGateway({
    localServiceList: [accounts, books, inventory, product, reviews],
    buildService: service => {
      return new LocalGraphQLDataSource(buildFederatedSchema([service]));
    },
  });

  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({ schema, executor });

  const upc = '1';
  const call = createTestClient(server);

  const query = gql`
    query GetProduct($upc: String!) {
      product(upc: $upc) {
        name
      }
    }
  `;

  const result = await call.query({
    query,
    variables: { upc },
  });

  expect(result.data).toEqual({
    product: {
      name: 'Table',
    },
  });

  const secondResult = await call.query({
    query,
    variables: { upc },
  });

  expect(result.data).toEqual(secondResult.data);
  expect(planner.buildQueryPlan).toHaveBeenCalledTimes(1);
});

it('supports multiple operations and operationName', async () => {
  const query = `#graphql
    query GetUser {
      me {
        username
      }
    }
    query GetReviews {
      topReviews {
        body
      }
    }
  `;

  const gateway = new ApolloGateway({
    localServiceList: [accounts, books, inventory, product, reviews],
    buildService: service => {
      return new LocalGraphQLDataSource(buildFederatedSchema([service]));
    },
  });

  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({ schema, executor });

  const { data: userData } = await server.executeOperation({
    query,
    operationName: 'GetUser',
  });

  const { data: reviewsData } = await server.executeOperation({
    query,
    operationName: 'GetReviews',
  });

  expect(userData).toEqual({
    me: { username: '@ada' },
  });
  expect(reviewsData).toEqual({
    topReviews: [
      { body: 'Love it!' },
      { body: 'Too expensive.' },
      { body: 'Could be better.' },
      { body: 'Prefer something else.' },
      { body: 'Wish I had read this before.' },
    ],
  });
});
