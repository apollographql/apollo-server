import gql from 'graphql-tag';
import { execute } from '../execution-utils';
import { serializeQueryPlan } from '../..';

it('supports passing additional fields defined by a requires', async () => {
  const query = `#graphql
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

  const { data, queryPlan } = await execute({
    query,
  });

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

it('collapses nested requires', async () => {
  const query = `#graphql
    query UserFavorites {
      user {
        favoriteColor
        favoriteAnimal
      }
    }
  `;

  const { data, errors, queryPlan } = await execute(
    {
      query,
    },
    [serviceA, serviceB],
  );

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

it('collapses nested requires with user-defined fragments', async () => {
  const query = `#graphql
    query UserFavorites {
      user {
        favoriteAnimal
        ...favoriteColor
      }
    }

    fragment favoriteColor on User {
      preferences {
        favorites {
          color
        }
      }
    }
  `;

  const { data, errors, queryPlan } = await execute(
    {
      query,
    },
    [serviceA, serviceB],
  );

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
                  animal
                  color
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
                    animal
                  }
                }
              }
            } =>
            {
              ... on User {
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
      preferences: {
        favorites: {
          color: 'limegreen',
        },
      },
    },
  });

  expect(queryPlan).toCallService('a');
  expect(queryPlan).toCallService('b');
});

it('passes null values correctly', async () => {
  const serviceA = {
    name: 'a',
    typeDefs: gql`
      type Query {
        user: User
      }

      type User @key(fields: "id") {
        id: ID!
        favorite: Color
        dislikes: [Color]
      }

      type Color {
        name: String!
      }
    `,
    resolvers: {
      Query: {
        user() {
          return {
            id: '1',
            favorite: null,
            dislikes: [null],
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
        favorite: Color @external
        dislikes: [Color] @external
        favoriteColor: String @requires(fields: "favorite { name }")
        dislikedColors: String @requires(fields: "dislikes { name }")
      }

      extend type Color {
        name: String! @external
      }
    `,
    resolvers: {
      User: {
        favoriteColor(user: any) {
          if (user.favorite !== null) {
            throw Error(
              'Favorite color should be null. Instead, got: ' +
                JSON.stringify(user.favorite),
            );
          }
          return 'unknown';
        },
        dislikedColors(user: any) {
          const color = user.dislikes[0];
          if (color !== null) {
            throw Error(
              'Disliked colors should be null. Instead, got: ' +
                JSON.stringify(user.dislikes),
            );
          }
          return 'unknown';
        },
      },
    },
  };

  const query = `#graphql
    query UserFavorites {
      user {
        favoriteColor
        dislikedColors
      }
    }
  `;

  const { data, errors } = await execute({ query }, [serviceA, serviceB]);

  expect(errors).toEqual(undefined);
  expect(data).toEqual({
    user: {
      favoriteColor: 'unknown',
      dislikedColors: 'unknown',
    },
  });
});
