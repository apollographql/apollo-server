import gql from 'graphql-tag';
import { execute, ServiceDefinitionModule } from '../execution-utils';
import { astSerializer, queryPlanSerializer } from '../../snapshotSerializers';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(queryPlanSerializer);

const users = [
  { id: '1', name: 'Trevor Scheer', organizationId: '1', __typename: 'User' },
  { id: '1', name: 'Trevor Scheer', organizationId: '2', __typename: 'User' },
  { id: '2', name: 'James Baxley', organizationId: '1', __typename: 'User' },
  { id: '2', name: 'James Baxley', organizationId: '3', __typename: 'User' },
];

const organizations = [
  { id: '1', name: 'Apollo', __typename: 'Organization' },
  { id: '2', name: 'Wayfair', __typename: 'Organization' },
  { id: '3', name: 'Major League Soccer', __typename: 'Organization' },
];

const reviews = [
  { id: '1', authorId: '1', organizationId: '1', __typename: 'Review' },
  { id: '2', authorId: '1', organizationId: '2', __typename: 'Review' },
  { id: '3', authorId: '2', organizationId: '1', __typename: 'Review' },
  { id: '4', authorId: '2', organizationId: '3', __typename: 'Review' },
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

    # TODO: consider ergonomics of external types.
    extend type User @key(fields: "id organization { id }") {
      id: ID! @external
      organization: Organization! @external
    }

    extend type Organization {
      id: ID! @external
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
          organization: {
            id: review.organizationId,
          },
        };
      },
    },
  },
};

const userService: ServiceDefinitionModule = {
  name: 'user',
  typeDefs: gql`
    type User @key(fields: "id organization { id }") {
      id: ID!
      name: String!
      organization: Organization!
    }

    type Organization @key(fields: "id") {
      id: ID!
      name: String!
    }
  `,
  resolvers: {
    User: {
      __resolveReference(reference) {
        return users.find(
          user =>
            user.id === reference.id &&
            user.organizationId === reference.organization.id,
        );
      },
      organization(user) {
        return { id: user.organizationId };
      },
    },
    Organization: {
      __resolveObject(object) {
        return organizations.find(org => org.id === object.id);
      },
    },
  },
};

it('works fetches data correctly with complex / nested @key fields', async () => {
  const query = gql`
    query Reviews {
      reviews {
        author {
          name
          organization {
            name
          }
        }
      }
    }
  `;

  const { data, queryPlan } = await execute([userService, reviewService], {
    query,
  });

  expect(data).toEqual({
    reviews: [
      {
        author: {
          name: 'Trevor Scheer',
          organization: {
            name: 'Apollo',
          },
        },
      },
      {
        author: {
          name: 'Trevor Scheer',
          organization: {
            name: 'Wayfair',
          },
        },
      },
      {
        author: {
          name: 'James Baxley',
          organization: {
            name: 'Apollo',
          },
        },
      },
      {
        author: {
          name: 'James Baxley',
          organization: {
            name: 'Major League Soccer',
          },
        },
      },
    ],
  });
  expect(queryPlan).toMatchInlineSnapshot(`
    QueryPlan {
      Sequence {
        Fetch(service: "review") {
          {
            reviews {
              author {
                __typename
                id
                organization {
                  id
                  __typename
                  id
                }
              }
            }
          }
        },
        Parallel {
          Flatten(path: "reviews.@.author") {
            Fetch(service: "user") {
              {
                ... on User {
                  __typename
                  id
                  organization {
                    id
                  }
                }
              } =>
              {
                ... on User {
                  name
                }
              }
            },
          },
          Flatten(path: "reviews.@.author.organization") {
            Fetch(service: "user") {
              {
                ... on Organization {
                  __typename
                  id
                }
              } =>
              {
                ... on Organization {
                  name
                }
              }
            },
          },
        },
      },
    }
  `);
});
