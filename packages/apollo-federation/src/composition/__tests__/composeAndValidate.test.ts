import { composeAndValidate } from '../composeAndValidate';
import gql from 'graphql-tag';
import { printSchema } from 'graphql';

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

it('demonstrates a potential bug', () => {
  const minimalSchema = gql`
    type Query {
      hello: String!
    }
  `;

  const schemaExtendingTypeWithNoBase = gql`
    type Query {
      whatever: String!
    }

    extend type NotMyType {
      thisOneIsMine: String!
    }
  `;

  const services = [
    { name: 'minimal', typeDefs: minimalSchema },
    { name: 'noBase', typeDefs: schemaExtendingTypeWithNoBase },
  ];

  const { errors, schema } = composeAndValidate(services);

  expect(errors).toHaveLength(0);
  expect(printSchema(schema)).toMatchInlineSnapshot(`
    "directive @key(fields: String!) on OBJECT | INTERFACE

    directive @extends on OBJECT

    directive @external on OBJECT | FIELD_DEFINITION

    directive @requires(fields: String!) on FIELD_DEFINITION

    directive @provides(fields: String!) on FIELD_DEFINITION

    type NotMyType {
      thisOneIsMine: String!
    }

    type Query {
      hello: String!
      whatever: String!
    }
    "
  `);
});

it.todo('errors on duplicate types where there is a mismatch of field types');
