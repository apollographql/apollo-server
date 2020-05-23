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
                    color
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

it('does not expand null objects in resolvers', async () => {
  const serviceA = {
    name: 'a',
    typeDefs: gql`
      type Query {
        actors: [Actor!]!
      }

      type Actor @key(fields: "id") {
        id: ID!
        name: String!
        dob: Date
        movies: [Movie]
      }

      type Date {
        year: String!
      }

      type Movie {
        name: String!
      }
    `,
    resolvers: {
      Query: {
        actors() {
          return [
            {
              id: '1',
              name: 'Tom Hanks',
              dob: null,
              movies: [
                {
                  name: 'Forrest Gump',
                },
                null,
              ],
            },
            {
              id: '2',
              name: 'Kate Winslet',
              dob: {
                year: '1975',
              },
              movies: null,
            },
          ];
        },
      },
    },
  };

  const serviceB = {
    name: 'b',
    typeDefs: gql`
      extend type Actor @key(fields: "id") {
        id: ID! @external
        dob: Date @external
        movies: [Movie] @external
        info: String! @requires(fields: "dob { year } movies { name }")
      }

      extend type Date {
        year: String! @external
      }

      extend type Movie {
        name: String! @external
      }
    `,
    resolvers: {
      Actor: {
        info(actor: any) {
          let info = '';
          if (actor.dob) {
            info += 'Born ' + actor.dob.year;
          }
          if (actor.movies) {
            info +=
              'Movies: ' +
              actor.movies
                .filter((movie: any) => movie)
                .map((movie: any) => movie.name)
                .join(', ');
          }
          return info;
        },
      },
    },
  };

  const query = `#graphql
    query Actors {
      actors {
        name
        info
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

  expect(data).toEqual({
    actors: [
      {
        name: 'Tom Hanks',
        info: 'Movies: Forrest Gump',
      },
      {
        name: 'Kate Winslet',
        info: 'Born 1975',
      },
    ],
  });

  expect(queryPlan).toCallService('a');
  expect(queryPlan).toCallService('b');
});
