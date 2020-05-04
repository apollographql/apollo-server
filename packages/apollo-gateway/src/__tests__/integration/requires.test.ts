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

const serviceA: ServiceDefinitionModule = {
  name: 'serviceA',
  typeDefs: gql`
    type Query {
      me: A
    }
    type A @key(fields: "id") {
      id: ID!
      name: String!
      nested1: Nested1!
      nested2: Nested2!
    }
    type Nested1 {
      nameA: String!
      nameB: String!
      nested2: Nested2
    }
    type Nested2 {
      nameA: String!
      nameB: String!
      nameC: String!
      nameD: String!
      nested3: [Nested3!]!
    }
    type Nested3 @key(fields: "id") {
      id: ID!
      nameA: String!
      nameB: String!
      nameC: String!
      nested4: Nested4!
    }
    type Nested4 {
      nameA: String!
      nameB: String!
    }
  `,
  resolvers: {
    Query: {
      me() {
        return {
          id: '1',
          name: 'name',
          nested1: {
            nameA: 'nested1.nameA',
            nameB: 'nested1.nameB',
            nested2: {
              nameA: 'nested1.nested2.nameA',
              nameB: 'nested1.nested2.nameB',
              nameC: 'nested1.nested2.nameC',
              nameD: 'nested1.nested2.nameD',
              nested3: [
                {
                  id: '2',
                  nameA: 'nested1.nested2.nested3.nameA',
                  nameB: 'nested1.nested2.nested3.nameB',
                  nameC: 'nested1.nested2.nested3.nameC',
                  nested4: {
                    nameA: 'nested1.nested2.nested3.nested4.nameA',
                    nameB: 'nested1.nested2.nested3.nested4.nameB',
                  },
                },
              ],
            },
          },
          nested2: {
            nameA: 'nested2.nameA',
            nameB: 'nested2.nameB',
            nameC: 'nested2.nameC',
            nameD: 'nested2.nameD',
            nested3: [
              {
                id: '3',
                nameA: 'nested2.nested3.nameA',
                nameB: 'nested2.nested3.nameB',
                nameC: 'nested2.nested3.nameC',
                nested4: {
                  nameA: 'nested2.nested3.nested4.nameA',
                  nameB: 'nested2.nested3.nested4.nameB',
                },
              },
            ],
          },
        };
      },
    },
  },
};

const serviceB: ServiceDefinitionModule = {
  name: 'serviceB',
  typeDefs: gql`
    extend type A @key(fields: "id") {
      id: ID! @external
      nested1: Nested1! @external
      nested2: Nested2! @external
      calculated1: String!
        @requires(fields: "nested1 { nameA nested2 { nameA } }")
      calculated2: String!
        @requires(
          fields: "nested1 { nameB  nested2 { nameB nested3 { nameA } } }"
        )
      calculated3: String!
        @requires(
          fields: "nested1 { nested2 { nested3 { nameB } } } nested2 { nameC nested3 { nameC } }"
        )
      calculated4: String!
        @requires(
          fields: "nested2 { nameC nameD nested3 { nested4 { nameA } } }"
        )
    }
    type Nested1 {
      nameA: String!
      nameB: String!
      nested2: Nested2
    }
    type Nested2 {
      nameA: String!
      nameB: String!
      nameC: String!
      nameD: String!
      nested3: [Nested3!]!
    }
    extend type Nested3 @key(fields: "id") {
      id: ID! @external
      nameA: String! @external
      nameB: String! @external
      nameC: String! @external
      nested4: Nested4! @external
      calculated5: String! @requires(fields: "nested4 { nameB }")
    }
    type Nested4 {
      nameA: String!
      nameB: String!
    }
  `,
  resolvers: {
    A: {
      calculated1(parent) {
        return parent.nested1.nameA + ' ' + parent.nested1.nested2.nameA;
      },
      calculated2(parent) {
        return (
          parent.nested1.nameB +
          ' ' +
          parent.nested1.nested2.nameB +
          ' ' +
          parent.nested1.nested2.nested3[0].nameA
        );
      },
      calculated3(parent) {
        return (
          parent.nested1.nested2.nested3[0].nameB +
          ' ' +
          parent.nested2.nameC +
          ' ' +
          parent.nested2.nested3[0].nameC
        );
      },
      calculated4(parent) {
        return (
          parent.nested2.nameC +
          ' ' +
          parent.nested2.nameD +
          ' ' +
          parent.nested2.nested3[0].nested4.nameA
        );
      },
    },
    Nested3: {
      calculated5(parent) {
        return parent.nested4.nameB;
      },
    },
  },
};

it('supports multiple arbitrarily nested fields defined by a requires', async () => {
  const query = gql`
    query Me {
      me {
        name
        calculated1
        calculated2
        calculated3
        calculated4
        nested2 {
          nested3 {
            calculated5
          }
        }
      }
    }
  `;

  const { data, queryPlan } = await execute([serviceA, serviceB], {
    query,
  });

  expect(data).toEqual({
    me: {
      name: 'name',
      calculated1: 'nested1.nameA nested1.nested2.nameA',
      calculated2:
        'nested1.nameB nested1.nested2.nameB nested1.nested2.nested3.nameA',
      calculated3:
        'nested1.nested2.nested3.nameB nested2.nameC nested2.nested3.nameC',
      calculated4: 'nested2.nameC nested2.nameD nested2.nested3.nested4.nameA',
      nested2: {
        nested3: [
          {
            calculated5: 'nested2.nested3.nested4.nameB',
          },
        ],
      },
    },
  });

  expect(queryPlan).toMatchInlineSnapshot(`
    QueryPlan {
      Sequence {
        Fetch(service: "serviceA") {
          {
            me {
              name
              __typename
              id
              nested1 {
                nameA
                nested2 {
                  nameA
                  nameB
                  nested3 {
                    nameA
                    nameB
                  }
                }
                nameB
              }
              nested2 {
                nameC
                nested3 {
                  nameC
                  nested4 {
                    nameA
                    nameB
                  }
                  __typename
                  id
                }
                nameD
              }
            }
          }
        },
        Parallel {
          Flatten(path: "me") {
            Fetch(service: "serviceB") {
              {
                ... on A {
                  __typename
                  id
                  nested1 {
                    nameA
                    nested2 {
                      nameA
                      nameB
                      nested3 {
                        nameA
                        nameB
                      }
                    }
                    nameB
                  }
                  nested2 {
                    nameC
                    nested3 {
                      nameC
                      nested4 {
                        nameA
                        nameB
                      }
                      __typename
                      id
                    }
                    nameD
                  }
                }
              } =>
              {
                ... on A {
                  calculated1
                  calculated2
                  calculated3
                  calculated4
                }
              }
            },
          },
          Flatten(path: "me.nested2.nested3.@") {
            Fetch(service: "serviceB") {
              {
                ... on Nested3 {
                  __typename
                  id
                  nested4 {
                    nameB
                  }
                }
              } =>
              {
                ... on Nested3 {
                  calculated5
                }
              }
            },
          },
        },
      },
    }
  `);
});

it('supports deeply nested fields defined by requires with fragments in user-defined queries', async () => {
  const query = gql`
    query Me {
      me {
        calculated3
        ...testFragment
      }
    }

    fragment testFragment on A {
      nested2 {
        nested3 {
          nameA
        }
      }
    }
  `;

  const { data } = await execute([serviceA, serviceB], {
    query,
  });

  expect(data).toEqual({
    me: {
      calculated3:
        'nested1.nested2.nested3.nameB nested2.nameC nested2.nested3.nameC',
      nested2: {
        nested3: [
          {
            nameA: 'nested2.nested3.nameA',
          },
        ],
      },
    },
  });
});
