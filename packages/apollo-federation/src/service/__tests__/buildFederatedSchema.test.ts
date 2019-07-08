import gql from 'graphql-tag';
import {
  Kind,
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql';
import { buildFederatedSchema } from '../buildFederatedSchema';
import { typeSerializer } from '../../snapshotSerializers';

expect.addSnapshotSerializer(typeSerializer);

const EMPTY_DOCUMENT = {
  kind: Kind.DOCUMENT,
  definitions: [],
};

const testFederatedSchema = (
  name: string,
  createSchema: () => GraphQLSchema,
  runTest: (schema: GraphQLSchema) => Promise<void>,
) => {
  const schema = createSchema();

  it(name, async () => {
    await runTest(schema);
  });

  it(`${name} (using "schema" argument)`, async () => {
    await runTest(buildFederatedSchema(schema));
  });
};

describe('buildFederatedSchema', () => {
  testFederatedSchema(
    'should mark a type with a key field as an entity',
    () => {
      return buildFederatedSchema(gql`
        type Product @key(fields: "upc") {
          upc: String!
          name: String
          price: Int
        }
      `);
    },
    async (schema: GraphQLSchema) => {
      expect(schema.getType('Product')).toMatchInlineSnapshot(`
type Product {
  upc: String!
  name: String
  price: Int
}
`);

      expect(schema.getType('_Entity')).toMatchInlineSnapshot(
        `union _Entity = Product`,
      );
    },
  );
  testFederatedSchema(
    `should mark a type with a key field as an entity`,
    () => {
      return buildFederatedSchema(gql`
        type Product @key(fields: "upc") {
          upc: String!
          name: String
          price: Int
        }
      `);
    },
    async (schema: GraphQLSchema) => {
      expect(schema.getType('Product')).toMatchInlineSnapshot(`
type Product {
  upc: String!
  name: String
  price: Int
}
`);

      expect(schema.getType('_Entity')).toMatchInlineSnapshot(
        `union _Entity = Product`,
      );
    },
  );

  testFederatedSchema(
    `should mark a type with multiple key fields as an entity`,
    () => {
      return buildFederatedSchema(gql`
        type Product @key(fields: "upc") @key(fields: "sku") {
          upc: String!
          sku: String!
          name: String
          price: Int
        }
      `);
    },
    schema => {
      expect(schema.getType('Product')).toMatchInlineSnapshot(`
type Product {
  upc: String!
  sku: String!
  name: String
  price: Int
}
`);

      expect(schema.getType('_Entity')).toMatchInlineSnapshot(
        `union _Entity = Product`,
      );
    },
  );

  testFederatedSchema(
    `should not mark a type without a key field as an entity`,
    () => {
      return buildFederatedSchema(gql`
        type Money {
          amount: Int!
          currencyCode: String!
        }
      `);
    },
    async (schema: GraphQLSchema) => {
      expect(schema.getType('Money')).toMatchInlineSnapshot(`
type Money {
  amount: Int!
  currencyCode: String!
}
`);
    },
  );

  testFederatedSchema(
    'should preserve description text in generated SDL',
    () => {
      return buildFederatedSchema(gql`
        "A user. This user is very complicated and requires so so so so so so so so so so so so so so so so so so so so so so so so so so so so so so so so much description text"
        type User @key(fields: "id") {
          """
          The unique ID of the user.
          """
          id: ID!
          "The user's name."
          name: String
          username: String
          foo(
            "Description 1"
            arg1: String
            "Description 2"
            arg2: String
            "Description 3 Description 3 Description 3 Description 3 Description 3 Description 3 Description 3 Description 3 Description 3 Description 3 Description 3"
            arg3: String
          ): String
        }
      `);
    },
    async (schema: GraphQLSchema) => {
      const query = `query GetServiceDetails {
        _service {
          sdl
        }
      }`;

      const { data, errors } = await graphql(schema, query);
      expect(errors).toBeUndefined();
      expect(data._service.sdl).toEqual(`"""
A user. This user is very complicated and requires so so so so so so so so so so
so so so so so so so so so so so so so so so so so so so so so so much
description text
"""
type User @key(fields: "id") {
  "The unique ID of the user."
  id: ID!
  "The user's name."
  name: String
  username: String
  foo(
    "Description 1"
    arg1: String
    "Description 2"
    arg2: String
    """
    Description 3 Description 3 Description 3 Description 3 Description 3
    Description 3 Description 3 Description 3 Description 3 Description 3 Description 3
    """
    arg3: String
  ): String
}
`);
    },
  );

  describe(`should add an _entities query root field to the schema`, () => {
    testFederatedSchema(
      `when a query root type with the default name has been defined`,
      () => {
        return buildFederatedSchema(gql`
          type Query {
            rootField: String
          }
          type Product @key(fields: "upc") {
            upc: ID!
          }
        `);
      },
      async (schema: GraphQLSchema) => {
        expect(schema.getQueryType()).toMatchInlineSnapshot(`
type Query {
  _entities(representations: [_Any!]!): [_Entity]!
  _service: _Service!
  rootField: String
}
`);
      },
    );

    testFederatedSchema(
      `when a query root type with a non-default name has been defined`,
      () => {
        return buildFederatedSchema(gql`
          schema {
            query: QueryRoot
          }

          type QueryRoot {
            rootField: String
          }
          type Product @key(fields: "upc") {
            upc: ID!
          }
        `);
      },
      async (schema: GraphQLSchema) => {
        expect(schema.getQueryType()).toMatchInlineSnapshot(`
type QueryRoot {
  _entities(representations: [_Any!]!): [_Entity]!
  _service: _Service!
  rootField: String
}
`);
      },
    );
  });
  describe(`should not add an _entities query root field to the schema`, () => {
    testFederatedSchema(
      `when no query root type has been defined`,
      () => {
        return buildFederatedSchema(EMPTY_DOCUMENT);
      },
      async (schema: GraphQLSchema) => {
        expect(schema.getQueryType()).toMatchInlineSnapshot(`
type Query {
  _service: _Service!
}
`);
      },
    );
    testFederatedSchema(
      `when no types with keys are found`,
      () => {
        return buildFederatedSchema(gql`
          type Query {
            rootField: String
          }
        `);
      },
      async (schema: GraphQLSchema) => {
        expect(schema.getQueryType()).toMatchInlineSnapshot(`
type Query {
  _service: _Service!
  rootField: String
}
`);
      },
    );
    testFederatedSchema(
      `when only an interface with keys are found`,
      () => {
        return buildFederatedSchema(gql`
          type Query {
            rootField: String
          }
          interface Product @key(fields: "upc") {
            upc: ID!
          }
        `);
      },
      async (schema: GraphQLSchema) => {
        expect(schema.getQueryType()).toMatchInlineSnapshot(`
type Query {
  _service: _Service!
  rootField: String
}
`);
      },
    );
  });
  describe('_entities root field', () => {
    testFederatedSchema(
      'executes resolveReference for a type if found',
      () => {
        return buildFederatedSchema([
          {
            typeDefs: gql`
              type Product @key(fields: "upc") {
                upc: Int
                name: String
              }
              type User @key(fields: "id") {
                firstName: String
              }
            `,
            resolvers: {
              Product: {
                __resolveReference(object) {
                  expect(object.upc).toEqual(1);
                  return { name: 'Apollo Gateway' };
                },
              },
              User: {
                __resolveReference(object) {
                  expect(object.id).toEqual(1);
                  return Promise.resolve({ firstName: 'James' });
                },
              },
            },
          },
        ]);
      },
      async (schema: GraphQLSchema) => {
        const query = `query GetEntities($representations: [_Any!]!) {
        _entities(representations: $representations) {
          ... on Product {
            name
          }
          ... on User {
            firstName
          }
        }
      }`;

        const variables = {
          representations: [
            { __typename: 'Product', upc: 1 },
            { __typename: 'User', id: 1 },
          ],
        };

        const { data, errors } = await graphql(
          schema,
          query,
          null,
          null,
          variables,
        );
        expect(errors).toBeUndefined();
        expect(data._entities[0].name).toEqual('Apollo Gateway');
        expect(data._entities[1].firstName).toEqual('James');
      },
    );
    testFederatedSchema(
      'executes resolveReference with default representation values',
      () => {
        return buildFederatedSchema(gql`
          type Product @key(fields: "upc") {
            upc: Int
            name: String
          }
        `);
      },
      async (schema: GraphQLSchema) => {
        const query = `query GetEntities($representations: [_Any!]!) {
      _entities(representations: $representations) {
        ... on Product {
          upc
          name
        }
      }
    }`;

        const variables = {
          representations: [
            { __typename: 'Product', upc: 1, name: 'Apollo Gateway' },
          ],
        };

        const { data, errors } = await graphql(
          schema,
          query,
          null,
          null,
          variables,
        );
        expect(errors).toBeUndefined();
        expect(data._entities[0].name).toEqual('Apollo Gateway');
      },
    );
  });
  describe('_service root field', () => {
    testFederatedSchema(
      'keeps extension types when owner type is not present',
      () => {
        return buildFederatedSchema(gql`
          type Review {
            id: ID
          }

          extend type Review {
            title: String
          }

          extend type Product @key(fields: "upc") {
            upc: String @external
            reviews: [Review]
          }
        `);
      },
      async (schema: GraphQLSchema) => {
        const query = `query GetServiceDetails {
      _service {
        sdl
      }
    }`;
        const { data, errors } = await graphql(schema, query);
        expect(errors).toBeUndefined();
        expect(data._service.sdl)
          .toEqual(`extend type Product @key(fields: "upc") {
  upc: String @external
  reviews: [Review]
}

type Review {
  id: ID
  title: String
}
`);
      },
    );
    testFederatedSchema(
      'keeps extension interface when owner interface is not present',
      () => {
        return buildFederatedSchema(gql`
          type Review {
            id: ID
          }

          extend type Review {
            title: String
          }

          interface Node @key(fields: "id") {
            id: ID!
          }

          extend interface Product @key(fields: "upc") {
            upc: String @external
            reviews: [Review]
          }
        `);
      },
      async (schema: GraphQLSchema) => {
        const query = `query GetServiceDetails {
    _service {
      sdl
    }
  }`;
        const { data, errors } = await graphql(schema, query);
        expect(errors).toBeUndefined();
        expect(data._service.sdl).toEqual(`interface Node @key(fields: "id") {
  id: ID!
}

extend interface Product @key(fields: "upc") {
  upc: String @external
  reviews: [Review]
}

type Review {
  id: ID
  title: String
}
`);
      },
    );
    testFederatedSchema(
      'returns valid sdl for @key directives',
      () => {
        return buildFederatedSchema(gql`
          type Product @key(fields: "upc") {
            upc: String!
            name: String
            price: Int
          }
        `);
      },
      async (schema: GraphQLSchema) => {
        const query = `query GetServiceDetails {
      _service {
        sdl
      }
    }`;
        const { data, errors } = await graphql(schema, query);
        expect(errors).toBeUndefined();
        expect(data._service.sdl).toEqual(`type Product @key(fields: "upc") {
  upc: String!
  name: String
  price: Int
}
`);
      },
    );
    testFederatedSchema(
      'returns valid sdl for multiple @key directives',
      () => {
        return buildFederatedSchema(gql`
          type Product @key(fields: "upc") @key(fields: "name") {
            upc: String!
            name: String
            price: Int
          }
        `);
      },
      async (schema: GraphQLSchema) => {
        const query = `query GetServiceDetails {
      _service {
        sdl
      }
    }`;
        const { data, errors } = await graphql(schema, query);
        expect(errors).toBeUndefined();
        expect(data._service.sdl)
          .toEqual(`type Product @key(fields: "upc") @key(fields: "name") {
  upc: String!
  name: String
  price: Int
}
`);
      },
    );
    testFederatedSchema(
      'supports all federation directives',
      () => {
        return buildFederatedSchema(gql`
          type Review @key(fields: "id") {
            id: ID!
            body: String
            author: User @provides(fields: "email")
            product: Product @provides(fields: "upc")
          }

          extend type User @key(fields: "email") {
            email: String @external
            reviews: [Review]
          }

          extend type Product @key(fields: "upc") {
            upc: String @external
            reviews: [Review]
          }
        `);
      },
      async (schema: GraphQLSchema) => {
        const query = `query GetServiceDetails {
        _service {
          sdl
        }
      }`;
        const { data, errors } = await graphql(schema, query);
        expect(errors).toBeUndefined();
        expect(data._service.sdl)
          .toEqual(`extend type Product @key(fields: "upc") {
  upc: String @external
  reviews: [Review]
}

type Review @key(fields: "id") {
  id: ID!
  body: String
  author: User @provides(fields: "email")
  product: Product @provides(fields: "upc")
}

extend type User @key(fields: "email") {
  email: String @external
  reviews: [Review]
}
`);
      },
    );
  });

  it('executes resolveReference for a type if found using manually created GraphQLSchema', async () => {
    const query = `query GetEntities($representations: [_Any!]!) {
    _entities(representations: $representations) {
      ... on Product {
        name
      }
      ... on User {
        firstName
      }
    }
  }`;

    const variables = {
      representations: [
        { __typename: 'Product', upc: 1 },
        { __typename: 'User', id: 1 },
      ],
    };

    const product: GraphQLObjectType = new GraphQLObjectType({
      name: 'Product',
      fields: () => ({
        upc: { type: GraphQLInt },
        name: { type: GraphQLString },
        __resolveReference: {
          type: product,
          resolve: (object: any) => {
            expect(object.upc).toEqual(1);
            return { name: 'Apollo Gateway' };
          },
        },
      }),
      astNode: {
        kind: 'ObjectTypeDefinition',
        name: {
          kind: 'Name',
          value: 'Product',
        },
        interfaces: [],
        directives: [
          {
            kind: 'Directive',
            name: {
              kind: 'Name',
              value: 'key',
            },
            arguments: [
              {
                kind: 'Argument',
                name: {
                  kind: 'Name',
                  value: 'fields',
                },
                value: {
                  kind: 'StringValue',
                  value: 'upc',
                  block: false,
                },
              },
            ],
          },
        ],
      },
    });

    const user: GraphQLObjectType = new GraphQLObjectType({
      name: 'User',
      fields: () => ({
        firstName: { type: GraphQLString },
        __resolveReference: {
          type: user,
          resolve: (object: any) => {
            expect(object.id).toEqual(1);
            return Promise.resolve({ firstName: 'James' });
          },
        },
      }),
      astNode: {
        kind: 'ObjectTypeDefinition',
        name: {
          kind: 'Name',
          value: 'User',
        },
        interfaces: [],
        directives: [
          {
            kind: 'Directive',
            name: {
              kind: 'Name',
              value: 'key',
            },
            arguments: [
              {
                kind: 'Argument',
                name: {
                  kind: 'Name',
                  value: 'fields',
                },
                value: {
                  kind: 'StringValue',
                  value: 'id',
                  block: false,
                },
              },
            ],
          },
        ],
      },
    });

    const schema = buildFederatedSchema(
      new GraphQLSchema({
        query: null,
        types: [product, user],
      }),
    );

    const { data, errors } = await graphql(
      schema,
      query,
      null,
      null,
      variables,
    );
    expect(errors).toBeUndefined();
    expect(data._entities[0].name).toEqual('Apollo Gateway');
    expect(data._entities[1].firstName).toEqual('James');
  });
});
