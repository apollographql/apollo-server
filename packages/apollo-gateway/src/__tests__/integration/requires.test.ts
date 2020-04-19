import gql from 'graphql-tag';
import { execute, ServiceDefinitionModule } from '../execution-utils';
import { astSerializer, queryPlanSerializer } from '../../snapshotSerializers';
import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(queryPlanSerializer);

it('supports passing additional scalar fields defined by a requires', async () => {
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


const publisherService: ServiceDefinitionModule = {
  name: 'publisher',
  typeDefs: gql`
    type Publisher {
      id: ID!
      name: String!
    }

    extend type User @key(fields: "id") {
      id: ID! @external
      organization: Organization! @external
      publisher: Publisher! @requires(fields: "organization { name address { country } }")
      publisherCity: String! @requires(fields: "organization { address { city coordinates { type value }}}")
    }

    type Organization {
      name: String!
      address: Address
    }

    type Address {
      city: String!
      country: String!
      coordinates: [Coordinate!]!
    }

    type Coordinate {
      type: CoordinateType!
      value: Float!
    }

    enum CoordinateType {
      LATITUDE
      LONGITUDE
    }
  `,
  resolvers: {
    User: {
      publisher(user) {
        return {
          id: 1,
          name: user.organization.name + ' ' + user.organization.address.country,
        }
      },
      publisherCity(user) {
        return user.organization.address.city + ' ' + user.organization.address.coordinates.map((coordinate: any) => coordinate.value).join(' ');
      },
    },
  },
};

const userService: ServiceDefinitionModule = {
  name: 'user',
  typeDefs: gql`
    type Query {
      me: User
    }

    type User @key(fields: "id") {
      id: ID!
      name: String!
      organization: Organization!
    }

    type Organization {
      name: String!
      address: Address
    }

    type Address {
      city: String!
      country: String!
      coordinates: [Coordinate!]!
    }

    type Coordinate {
      type: CoordinateType!
      value: Float!
    }

    enum CoordinateType {
      LATITUDE
      LONGITUDE
    }
  `,
  resolvers: {
    Query: {
      me() {
        return {
          id: 'abc',
          name: 'meme',
          organization: {
            name: 'org 1',
            address: {
              city: 'New York',
              country: 'USA',
              coordinates: [
                {type: 'LATITUDE', value: 123},
                {type: 'LONGITUDE', value: 321},
              ]
            }
          }
        }
      }
    }
  },
};

it('supports passing additional deeply nested fields defined by a requires', async () => {
  const query = gql`
    query Me {
      me {
        name
        publisher {
          id
          name
        }
        publisherCity
      }
    }
  `;

  const { data, queryPlan } = await execute([userService, publisherService], {
    query,
  });

  console.log(data);
  expect(queryPlan).toMatchInlineSnapshot(`
    QueryPlan {
      Sequence {
        Fetch(service: "user") {
          {
            me {
              name
              __typename
              id
              organization {
                name
                address {
                  country
                  city
                  city
                  coordinates {
                    type
                    value
                    type
                    value
                  }
                }
              }
            }
          }
        },
        Flatten(path: "me") {
          Fetch(service: "publisher") {
            {
              ... on User {
                __typename
                id
                organization {
                  name
                  address {
                    country
                    city
                    city
                    coordinates {
                      type
                      value
                      type
                      value
                    }
                  }
                }
              }
            } =>
            {
              ... on User {
                publisher {
                  id
                  name
                }
                publisherCity
              }
            }
          },
        },
      },
    }
  `);
});
