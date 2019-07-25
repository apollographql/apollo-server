import { composeAndValidate } from '../composeAndValidate';
import gql from 'graphql-tag';
import { GraphQLObjectType } from 'graphql';
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
  ]).map((config, i) => {
    const { warnings, errors } = composeAndValidate(config);

    if (warnings.length || errors.length) {
      console.error(
        `Errors or warnings found with composition [${config.map(
          item => item.name,
        )}]`,
      );
    }

    expect({ warnings, errors }).toMatchInlineSnapshot(`
      Object {
        "errors": Array [],
        "warnings": Array [],
      }
    `);
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

  const { schema, errors } = composeAndValidate([serviceA, serviceB]);
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

it.todo('errors on duplicate types where there is a mismatch of field types');
