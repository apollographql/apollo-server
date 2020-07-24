import gql from 'graphql-tag';
import { createTestClient } from 'apollo-server-testing';
import { ApolloServerBase as ApolloServer } from 'apollo-server-core';
import { buildFederatedSchema } from '@apollo/federation';

import { LocalGraphQLDataSource } from '../../datasources/LocalGraphQLDataSource';
import { ApolloGateway } from '../../';
import { fixtures } from 'apollo-federation-integration-testsuite';

it('caches the query plan for a request', async () => {
  const planner = require('../../buildQueryPlan');
  const originalPlanner = planner.buildQueryPlan;

  planner.buildQueryPlan = jest.fn(originalPlanner);

  const gateway = new ApolloGateway({
    localServiceList: fixtures,
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
    localServiceList: fixtures,
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

it('does not corrupt cached queryplan data across requests', async () => {
  const serviceA = {
    name: 'a',
    typeDefs: gql`
      type Query {
        user: User
      }

      type User @key(fields: "id") {
        id: ID!
        preferences: Preferences
      }

      type Preferences {
        favorites: Things
      }

      type Things {
        color: String
        animal: String
      }
    `,
    resolvers: {
      Query: {
        user() {
          return {
            id: '1',
            preferences: {
              favorites: { color: 'limegreen', animal: 'platypus' },
            },
          };
        },
      },
    },
  };

  const serviceB = {
    name: 'b',
    typeDefs: gql`
      extend type User @key(fields: "id") {
        id: ID! @external
        preferences: Preferences @external
        favoriteColor: String
          @requires(fields: "preferences { favorites { color } }")
        favoriteAnimal: String
          @requires(fields: "preferences { favorites { animal } }")
      }

      extend type Preferences {
        favorites: Things @external
      }

      extend type Things {
        color: String @external
        animal: String @external
      }
    `,
    resolvers: {
      User: {
        favoriteColor(user: any) {
          return user.preferences.favorites.color;
        },
        favoriteAnimal(user: any) {
          return user.preferences.favorites.animal;
        },
      },
    },
  };

  const gateway = new ApolloGateway({
    localServiceList: [serviceA, serviceB],
    buildService: service => {
      return new LocalGraphQLDataSource(buildFederatedSchema([service]));
    },
  });

  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({ schema, executor });

  const call = createTestClient(server);

  const query1 = `#graphql
    query UserFavoriteColor {
      user {
        favoriteColor
      }
    }
  `;

  const query2 = `#graphql
    query UserFavorites {
      user {
        favoriteColor
        favoriteAnimal
      }
    }
  `;

  const result1 = await call.query({
    query: query1,
  });
  const result2 = await call.query({
    query: query2,
  });
  const result3 = await call.query({
    query: query1,
  });

  expect(result1.errors).toEqual(undefined);
  expect(result2.errors).toEqual(undefined);
  expect(result3.errors).toEqual(undefined);
  expect(result1).toEqual(result3);
});
