import gql from 'graphql-tag';
import { execute, ServiceDefinitionModule } from '../execution-utils';
import { astSerializer, queryPlanSerializer } from '../../snapshotSerializers';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(queryPlanSerializer);

const users = [
  { id: ['1', '1'], name: 'Trevor Scheer', __typename: 'User' },
  { id: ['2', '2'], name: 'James Baxley', __typename: 'User' },
];

const reviews = [
  { id: '1', authorId: ['1', '1'], body: 'Good', __typename: 'Review' },
  { id: '2', authorId: ['2', '2'], body: 'Bad', __typename: 'Review' },
];

const reviewService: ServiceDefinitionModule = {
  name: 'review',
  typeDefs: gql`
    type Query {
      reviews: [Review!]!
    }

    type Review {
      id: ID!
      author: User!
      body: String!
    }

    extend type User @key(fields: "id") {
      id: [ID!]! @external
    }
  `,
  resolvers: {
    Query: {
      reviews() {
        return reviews;
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

const listsAreEqual = <T>(as: T[], bs: T[]) =>
  as.length === bs.length && as.every((a, i) => bs[i] === as[i]);

const userService: ServiceDefinitionModule = {
  name: 'user',
  typeDefs: gql`
    type User @key(fields: "id") {
      id: [ID!]!
      name: String!
    }
  `,
  resolvers: {
    User: {
      __resolveReference(reference) {
        return users.find(user => listsAreEqual(user.id, reference.id));
      },
    },
  },
};

it('fetches data correctly list type @key fields', async () => {
  const query = `#graphql
    query Reviews {
      reviews {
        body
        author {
          name
        }
      }
    }
  `;

  const { data, queryPlan } = await execute(
    {
      query,
    },
    [userService, reviewService],
  );

  expect(data).toEqual({
    reviews: [
      { body: 'Good', author: { name: 'Trevor Scheer' } },
      { body: 'Bad', author: { name: 'James Baxley' } },
    ],
  });
  expect(queryPlan).toMatchInlineSnapshot(`
    QueryPlan {
      Sequence {
        Fetch(service: "review") {
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
          Fetch(service: "user") {
            {
              ... on User {
                __typename
                id
              }
            } =>
            {
              ... on User {
                name
              }
            }
          },
        },
      },
    }
  `);
});
