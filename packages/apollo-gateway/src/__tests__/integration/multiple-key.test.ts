import gql from 'graphql-tag';
import { execute, ServiceDefinitionModule } from '../execution-utils';
import { astSerializer, queryPlanSerializer } from '../../snapshotSerializers';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(queryPlanSerializer);

const users = [
  { ssn: '111-11-1111', name: 'Trevor', id: '10', __typename: 'User' },
  { ssn: '222-22-2222', name: 'Scheer', id: '20', __typename: 'User' },
  { ssn: '333-33-3333', name: 'James', id: '30', __typename: 'User' },
  { ssn: '444-44-4444', name: 'Baxley', id: '40', __typename: 'User' },
];

const reviews = [
  { id: '1', authorId: '10', body: 'A', __typename: 'Review' },
  { id: '2', authorId: '20', body: 'B', __typename: 'Review' },
  { id: '3', authorId: '30', body: 'C', __typename: 'Review' },
  { id: '4', authorId: '40', body: 'D', __typename: 'Review' },
];

const reviewService: ServiceDefinitionModule = {
  name: 'reviews',
  typeDefs: gql`
    extend type Query {
      reviews: [Review!]!
    }

    type Review {
      id: ID!
      author: User!
      body: String!
    }

    extend type User @key(fields: "id") {
      id: ID! @external
      reviews: [Review!]!
    }
  `,
  resolvers: {
    Query: {
      reviews() {
        return reviews;
      },
    },
    User: {
      reviews(user) {
        return reviews.filter(review => review.authorId === user.id);
      },
    },
    Review: {
      author(review) {
        return {
          id: review.authorId,
        };
      },
    },
  },
};

const actuaryService: ServiceDefinitionModule = {
  name: 'actuary',
  typeDefs: gql`
    extend type User @key(fields: "ssn") {
      ssn: ID! @external
      risk: Float
    }
  `,
  resolvers: {
    User: {
      risk(user) {
        return user.ssn[0] / 10;
      },
    },
  },
};

const userService: ServiceDefinitionModule = {
  name: 'users',
  typeDefs: gql`
    extend type Query {
      users: [User!]!
    }

    type Group {
      id: ID
      name: String
    }

    type User
      @key(fields: "ssn")
      @key(fields: "id")
      @key(fields: "group { id }") {
      id: ID!
      ssn: ID!
      name: String!
      group: Group
    }
  `,
  resolvers: {
    Query: {
      users() {
        return users;
      },
    },
    User: {
      group: () => ({ id: 1, name: 'Apollo GraphQL' }),
      __resolveReference(reference) {
        if (reference.ssn)
          return users.find(user => user.ssn === reference.ssn);
        else return users.find(user => user.id === reference.id);
      },
    },
  },
};

it('fetches data correctly with multiple @key fields', async () => {
  const query = gql`
    query {
      reviews {
        body
        author {
          name
          risk
        }
      }
    }
  `;

  const { data, queryPlan, errors } = await execute(
    [userService, reviewService, actuaryService],
    {
      query,
    },
  );

  expect(errors).toBeFalsy();
  expect(data).toEqual({
    reviews: [
      {
        body: 'A',
        author: {
          risk: 0.1,
          name: 'Trevor',
        },
      },
      {
        body: 'B',
        author: {
          risk: 0.2,
          name: 'Scheer',
        },
      },
      {
        body: 'C',
        author: {
          risk: 0.3,
          name: 'James',
        },
      },
      {
        body: 'D',
        author: {
          risk: 0.4,
          name: 'Baxley',
        },
      },
    ],
  });

  expect(queryPlan).toMatchInlineSnapshot(`
    QueryPlan {
      Sequence {
        Fetch(service: "reviews") {
          {
            reviews {
              body
              author {
                __typename
                id
              }
            }
          }
        },
        Flatten(path: "reviews.@.author") {
          Fetch(service: "users") {
            {
              ... on User {
                __typename
                id
              }
            } =>
            {
              ... on User {
                name
                __typename
                ssn
              }
            }
          },
        },
        Flatten(path: "reviews.@.author") {
          Fetch(service: "actuary") {
            {
              ... on User {
                __typename
                ssn
              }
            } =>
            {
              ... on User {
                risk
              }
            }
          },
        },
      },
    }
  `);
});

it('fetches keys as needed to reduce round trip queries', async () => {
  const query = gql`
    query {
      users {
        risk
        reviews {
          body
        }
      }
    }
  `;

  const { data, queryPlan, errors } = await execute(
    [userService, reviewService, actuaryService],
    {
      query,
    },
  );

  expect(errors).toBeFalsy();
  expect(data).toEqual({
    users: [
      {
        risk: 0.1,
        reviews: [
          {
            body: 'A',
          },
        ],
      },
      {
        risk: 0.2,
        reviews: [
          {
            body: 'B',
          },
        ],
      },
      {
        risk: 0.3,
        reviews: [
          {
            body: 'C',
          },
        ],
      },
      {
        risk: 0.4,
        reviews: [
          {
            body: 'D',
          },
        ],
      },
    ],
  });

  expect(queryPlan).toMatchInlineSnapshot(`
        QueryPlan {
          Sequence {
            Fetch(service: "users") {
              {
                users {
                  __typename
                  ssn
                  id
                }
              }
            },
            Parallel {
              Flatten(path: "users.@") {
                Fetch(service: "actuary") {
                  {
                    ... on User {
                      __typename
                      ssn
                    }
                  } =>
                  {
                    ... on User {
                      risk
                    }
                  }
                },
              },
              Flatten(path: "users.@") {
                Fetch(service: "reviews") {
                  {
                    ... on User {
                      __typename
                      id
                    }
                  } =>
                  {
                    ... on User {
                      reviews {
                        body
                      }
                    }
                  }
                },
              },
            },
          },
        }
      `);
});
