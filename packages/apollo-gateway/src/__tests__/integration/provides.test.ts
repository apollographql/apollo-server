import gql from 'graphql-tag';
import { execute, overrideResolversInService } from '../execution-utils';

import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

import { astSerializer, queryPlanSerializer } from '../../snapshotSerializers';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(queryPlanSerializer);

it('does not have to go to another service when field is given', async () => {
  const query = gql`
    query GetReviewers {
      topReviews {
        author {
          username
        }
      }
    }
  `;

  const { data, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
    },
  );

  expect(data).toEqual({
    topReviews: [
      { author: { username: '@ada' } },
      { author: { username: '@ada' } },
      { author: { username: '@complete' } },
      { author: { username: '@complete' } },
      { author: { username: '@complete' } },
    ],
  });

  expect(queryPlan).not.toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
});

it('does not load fields provided even when going to other service', async () => {
  const username = jest.fn();
  const localAccounts = overrideResolversInService(accounts, {
    User: {
      username,
    },
  });

  const query = gql`
    query GetReviewers {
      topReviews {
        author {
          username
          name
        }
      }
    }
  `;

  const { data, queryPlan } = await execute(
    [localAccounts, books, inventory, product, reviews],
    {
      query,
    },
  );

  expect(data).toEqual({
    topReviews: [
      { author: { username: '@ada', name: 'Ada Lovelace' } },
      { author: { username: '@ada', name: 'Ada Lovelace' } },
      { author: { username: '@complete', name: 'Alan Turing' } },
      { author: { username: '@complete', name: 'Alan Turing' } },
      { author: { username: '@complete', name: 'Alan Turing' } },
    ],
  });

  expect(username).not.toHaveBeenCalled();
  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
});

it('TODO', async () => {
  const query = gql`
    query Electronic {
      electronic(sku: "TABLE1") {
        sku
        price
        name
      }
    }
  `;

  const electronicsService = {
    name: 'electronics',
    typeDefs: gql`
      directive @stream on FIELD
      directive @transform(from: String!) on FIELD

      extend type Query {
        electronic(sku: String!): Product @provides(fields: "price")
      }

      type Electronic implements Product {
        sku: String!
        upc: String!
        name: String
        inStock: Boolean
        reviews: [Review]
        price: String
        voltage: Int
      }

      extend type Furniture implements Product @key(fields: "sku") {
        sku: String! @external
        upc: String! @external
      }

      extend type Book implements Product @key(fields: "isbn") {
        isbn: String! @external
      }

      extend type Review @key(fields: "id") {
        id: ID! @external
      }

      extend interface Product @key(fields: "upc") {
        upc: String! @external
        sku: String! @external
        price: String @external
      }
    `,
    resolvers: {
      Query: {
        electronic() {
          return { __typename: 'Furniture', sku: 'TABLE1', price: '699' };
        },
      },
    },
  };

  const { data, queryPlan, errors } = await execute(
    [electronicsService, accounts, books, inventory, product, reviews],
    {
      query,
    },
  );

  errors.map(err => {
    console.log(err.extensions);
  });

  expect(errors).toMatchInlineSnapshot(`
    Array [
      [GraphQLError: Fragment cannot be spread here as objects of type "Product" can never be of type "Book".],
      [GraphQLError: Fragment cannot be spread here as objects of type "Product" can never be of type "Furniture".],
      [GraphQLError: Cannot query field "price" on type "Furniture".],
    ]
  `);

  expect(data).toMatchInlineSnapshot(`
    Object {
      "electronic": null,
    }
  `);

  expect(queryPlan).toMatchInlineSnapshot(`
    QueryPlan {
      Sequence {
        Fetch(service: "electronics") {
          {
            electronic(sku: "TABLE1") {
              __typename
              ... on Book {
                __typename
                isbn
              }
              ... on Electronic {
                sku
                price
                name
              }
              ... on Furniture {
                sku
                price
                __typename
              }
            }
          }
        },
        Parallel {
          Flatten(path: "electronic") {
            Fetch(service: "product") {
              {
                ... on Book {
                  __typename
                  isbn
                }
                ... on Furniture {
                  __typename
                  sku
                }
              } =>
              {
                ... on Book {
                  sku
                  price
                }
                ... on Furniture {
                  name
                }
              }
            },
          },
          Sequence {
            Flatten(path: "electronic") {
              Fetch(service: "books") {
                {
                  ... on Book {
                    __typename
                    isbn
                  }
                } =>
                {
                  ... on Book {
                    __typename
                    isbn
                    title
                    year
                  }
                }
              },
            },
            Flatten(path: "electronic") {
              Fetch(service: "product") {
                {
                  ... on Book {
                    __typename
                    isbn
                    title
                    year
                  }
                } =>
                {
                  ... on Book {
                    name
                  }
                }
              },
            },
          },
        },
      },
    }
  `);
  // expect(queryPlan).toCallService('accounts');
  // expect(queryPlan).toCallService('reviews');
});
