import { composeAndValidate } from '../composeAndValidate';
import gql from 'graphql-tag';
import { GraphQLObjectType, DocumentNode } from 'graphql';
import {
  astSerializer,
  typeSerializer,
  graphqlErrorSerializer,
} from '../../snapshotSerializers';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(typeSerializer);
expect.addSnapshotSerializer(graphqlErrorSerializer);

const productsService = {
  name: 'Products',
  typeDefs: gql`
    extend type Query {
      topProducts(first: Int): [Product]
    }
    type Product @key(fields: "upc") {
      upc: String!
      sku: String!
      name: String
      price: String
    }
  `,
};

const reviewsService = {
  name: 'Reviews',
  typeDefs: gql`
    type Review @key(fields: "id") {
      id: ID!
      body: String
      author: User
      product: Product
    }

    extend type User @key(fields: "id") {
      id: ID! @external
      reviews: [Review]
    }
    extend type Product @key(fields: "upc") {
      upc: String! @external
      reviews: [Review]
    }
  `,
};

const accountsService = {
  name: 'Accounts',
  typeDefs: gql`
    extend type Query {
      me: User
    }
    type User @key(fields: "id") {
      id: ID!
      name: String
      username: String
      birthDate: String
    }
  `,
};

const inventoryService = {
  name: 'Inventory',
  typeDefs: gql`
    extend type Product @key(fields: "upc") {
      upc: String! @external
      inStock: Boolean
      # quantity: Int
    }
  `,
};

function permutateList<T>(inputArr: T[]) {
  let result: T[][] = [];

  function permute(arr: T[], m: T[] = []) {
    if (arr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  }

  permute(inputArr);

  return result;
}

it('composes and validates all (24) permutations without error', () => {
  permutateList([
    inventoryService,
    reviewsService,
    accountsService,
    productsService,
  ]).map(config => {
    const { errors } = composeAndValidate(config);

    if (errors.length) {
      console.error(
        `Errors found with composition [${config.map(item => item.name)}]`,
      );
    }

    expect(errors).toHaveLength(0);
  });
});

it('errors when a type extension has no base', () => {
  const serviceA = {
    typeDefs: gql`
      schema {
        query: MyRoot
      }

      type MyRoot {
        products: [Product]!
      }

      type Product @key(fields: "sku") {
        sku: String!
        upc: String!
      }
    `,
    name: 'serviceA',
  };

  const serviceB = {
    typeDefs: gql`
      extend type Location {
        id: ID
      }
    `,
    name: 'serviceB',
  };

  const { errors } = composeAndValidate([serviceA, serviceB]);
  expect(errors).toHaveLength(1);
  expect(errors).toMatchInlineSnapshot(`
    Array [
      Object {
        "code": "EXTENSION_WITH_NO_BASE",
        "message": "[serviceB] Location -> \`Location\` is an extension type, but \`Location\` is not defined in any service",
      },
    ]
  `);
});

it('treats types with @extends as type extensions', () => {
  const serviceA = {
    typeDefs: gql`
      type Query {
        products: [Product]!
      }

      type Product @key(fields: "sku") {
        sku: String!
        upc: String!
      }
    `,
    name: 'serviceA',
  };

  const serviceB = {
    typeDefs: gql`
      type Product @extends @key(fields: "sku") {
        sku: String! @external
        price: Int! @requires(fields: "sku")
      }
    `,
    name: 'serviceB',
  };

  const { schema, errors } = composeAndValidate([serviceA, serviceB]);
  expect(errors).toHaveLength(0);

  const product = schema.getType('Product') as GraphQLObjectType;
  expect(product).toMatchInlineSnapshot(`
    type Product {
      sku: String!
      upc: String!
      price: Int!
    }
  `);
});

it('treats interfaces with @extends as interface extensions', () => {
  const serviceA = {
    typeDefs: gql`
      type Query {
        products: [Product]!
      }

      interface Product @key(fields: "sku") {
        sku: String!
        upc: String!
      }
    `,
    name: 'serviceA',
  };

  const serviceB = {
    typeDefs: gql`
      interface Product @extends @key(fields: "sku") {
        sku: String! @external
        price: Int! @requires(fields: "sku")
      }
    `,
    name: 'serviceB',
  };

  const { schema, errors } = composeAndValidate([serviceA, serviceB]);
  expect(errors).toHaveLength(0);

  const product = schema.getType('Product') as GraphQLObjectType;
  expect(product).toMatchInlineSnapshot(`
    interface Product {
      sku: String!
      upc: String!
      price: Int!
    }
  `);
});

it('errors on invalid usages of default operation names', () => {
  const serviceA = {
    typeDefs: gql`
      schema {
        query: RootQuery
      }

      type RootQuery {
        product: Product
      }

      type Product @key(fields: "id") {
        id: ID!
        query: Query
      }

      type Query {
        invalidUseOfQuery: Boolean
      }
    `,
    name: 'serviceA',
  };

  const serviceB = {
    typeDefs: gql`
      type Query {
        validUseOfQuery: Boolean
      }

      extend type Product @key(fields: "id") {
        id: ID! @external
        sku: String
      }
    `,
    name: 'serviceB',
  };

  const { errors } = composeAndValidate([serviceA, serviceB]);
  expect(errors).toMatchInlineSnapshot(`
    Array [
      Object {
        "code": "ROOT_QUERY_USED",
        "message": "[serviceA] Query -> Found invalid use of default root operation name \`Query\`. \`Query\` is disallowed when \`Schema.query\` is set to a type other than \`Query\`.",
      },
    ]
  `);
});

describe('composition of value types', () => {
  function getSchemaWithValueType(valueType: DocumentNode) {
    const serviceA = {
      typeDefs: gql`
        ${valueType}

        type Query {
          filler: String
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: valueType,
      name: 'serviceB',
    };

    return composeAndValidate([serviceA, serviceB]);
  }

  describe('success', () => {
    it('scalars', () => {
      const { errors, schema } = getSchemaWithValueType(
        gql`
          scalar Date
        `,
      );
      expect(errors).toHaveLength(0);
      expect(schema.getType('Date')).toMatchInlineSnapshot(`scalar Date`);
    });

    it('unions and object types', () => {
      const { errors, schema } = getSchemaWithValueType(
        gql`
          union CatalogItem = Couch | Mattress

          type Couch {
            sku: ID!
            material: String!
          }

          type Mattress {
            sku: ID!
            size: String!
          }
        `,
      );
      expect(errors).toHaveLength(0);
      expect(schema.getType('CatalogItem')).toMatchInlineSnapshot(
        `union CatalogItem = Couch | Mattress`,
      );
      expect(schema.getType('Couch')).toMatchInlineSnapshot(`
      type Couch {
        sku: ID!
        material: String!
      }
    `);
    });

    it('input types', () => {
      const { errors, schema } = getSchemaWithValueType(gql`
        input NewProductInput {
          sku: ID!
          type: String
        }
      `);
      expect(errors).toHaveLength(0);
      expect(schema.getType('NewProductInput')).toMatchInlineSnapshot(`
      input NewProductInput {
        sku: ID!
        type: String
      }
    `);
    });

    it('interfaces', () => {
      const { errors, schema } = getSchemaWithValueType(gql`
        interface Product {
          sku: ID!
        }
      `);
      expect(errors).toHaveLength(0);
      expect(schema.getType('Product')).toMatchInlineSnapshot(`
      interface Product {
        sku: ID!
      }
    `);
    });

    it('enums', () => {
      const { errors, schema } = getSchemaWithValueType(gql`
        enum CatalogItemEnum {
          COUCH
          MATTRESS
        }
      `);
      expect(errors).toHaveLength(0);
      expect(schema.getType('CatalogItemEnum')).toMatchInlineSnapshot(`
      enum CatalogItemEnum {
        COUCH
        MATTRESS
      }
    `);
    });
  });

  describe('errors', () => {
    it('when used as an entity', () => {
      const serviceA = {
        typeDefs: gql`
          type Query {
            product: Product
          }

          type Product {
            sku: ID!
            color: String!
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          type Query {
            topProducts: [Product]
          }

          type Product @key(fields: "sku") {
            sku: ID!
            color: String!
          }
        `,
        name: 'serviceB',
      };

      const { errors } = composeAndValidate([serviceA, serviceB]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchInlineSnapshot(`
        Object {
          "code": "VALUE_TYPE_NO_ENTITY",
          "message": "[serviceB] Product -> Value types cannot be entities (using the \`@key\` directive). Please ensure that the \`Product\` type is extended properly or remove the \`@key\` directive if this is not an entity.",
        }
      `);
    });

    it('on field type mismatch', () => {
      const serviceA = {
        typeDefs: gql`
          type Query {
            product: Product
          }

          type Product {
            sku: ID!
            color: String!
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          type Query {
            topProducts: [Product]
          }

          type Product {
            sku: ID!
            color: String
          }
        `,
        name: 'serviceB',
      };

      const { errors } = composeAndValidate([serviceA, serviceB]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchInlineSnapshot(`
        Object {
          "code": "VALUE_TYPE_FIELD_TYPE_MISMATCH",
          "message": "[serviceA] Product.color -> A field was defined differently in different services. \`serviceA\` and \`serviceB\` define \`Product.color\` as a String! and String respectively. In order to define \`Product\` in multiple places, the fields and their types must be identical.",
        }
      `);
    });

    it('on kind mismatch', () => {
      const serviceA = {
        typeDefs: gql`
          type Query {
            product: Product
          }

          interface Product {
            sku: ID!
            color: String!
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          type Query {
            topProducts: [Product]
          }

          type Product {
            sku: ID!
            color: String!
          }
        `,
        name: 'serviceB',
      };

      const { errors } = composeAndValidate([serviceA, serviceB]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchInlineSnapshot(`
        Object {
          "code": "VALUE_TYPE_KIND_MISMATCH",
          "message": "[serviceA] Product -> Found kind mismatch on expected value type belonging to services \`serviceA\` and \`serviceB\`. \`Product\` is defined as both a \`ObjectTypeDefinition\` and a \`InterfaceTypeDefinition\`. In order to define \`Product\` in multiple places, the kinds must be identical.",
        }
      `);
    });

    it('on union types mismatch', () => {
      const serviceA = {
        typeDefs: gql`
          type Query {
            product: Product
          }

          type Couch {
            sku: ID!
          }

          type Mattress {
            sku: ID!
          }

          union Product = Couch | Mattress
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          type Query {
            topProducts: [Product]
          }

          type Couch {
            sku: ID!
          }

          type Cabinet {
            sku: ID!
          }

          union Product = Couch | Cabinet
        `,
        name: 'serviceB',
      };

      const { errors } = composeAndValidate([serviceA, serviceB]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchInlineSnapshot(`
        Object {
          "code": "VALUE_TYPE_UNION_TYPES_MISMATCH",
          "message": "[serviceA] Product -> The union \`Product\` is defined in services \`serviceA\` and \`serviceB\`, however their types do not match. Union types with the same name must also consist of identical types. The types Cabinet, Mattress are mismatched.",
        }
      `);
    });
  });
});
