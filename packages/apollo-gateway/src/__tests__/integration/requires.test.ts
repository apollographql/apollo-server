import gql from 'graphql-tag';
import { execute } from '../execution-utils';
import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';
import { serializeQueryPlan } from '../..';

it('supports passing additional fields defined by a requires', async () => {
  const query = gql`
    query GetReviwedBookNames {
      me {
        reviews {
          product {
            ... on Book {
              name
            }
          }
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
    me: {
      reviews: [
        { product: {} },
        { product: {} },
        {
          product: {
            name: 'Design Patterns (1995)',
          },
        },
      ],
    },
  });

  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
  expect(queryPlan).toCallService('product');
  expect(queryPlan).toCallService('books');
});

it('collapses nested requires', async () => {
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
            preferences: { favorites: { color: 'limegreen', animal: 'platypus' } },
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

  const query = gql`
    query UserFavorites {
      user {
        favoriteColor
        favoriteAnimal
      }
    }
  `;

  const { data, errors, queryPlan } = await execute([serviceA, serviceB], {
    query,
  });

  expect(errors).toEqual(undefined);

  expect(serializeQueryPlan(queryPlan)).toMatchInlineSnapshot(`
    "QueryPlan {
      Sequence {
        Fetch(service: \\"a\\") {
          {
            user {
              __typename
              id
              preferences {
                favorites {
                  color
                  animal
                }
              }
            }
          }
        },
        Flatten(path: \\"user\\") {
          Fetch(service: \\"b\\") {
            {
              ... on User {
                __typename
                id
                preferences {
                  favorites {
                    color
                    animal
                  }
                }
              }
            } =>
            {
              ... on User {
                favoriteColor
                favoriteAnimal
              }
            }
          },
        },
      },
    }"
  `);

  expect(data).toEqual({
    user: {
      favoriteAnimal: 'platypus',
      favoriteColor: 'limegreen',
    },
  });

  expect(queryPlan).toCallService('a');
  expect(queryPlan).toCallService('b');
});
