import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { keySelectionSetsDeclared } from '..';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('keySelectionSetsDeclared', () => {
  it('returns no warnings with proper @key usage', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String! @external
          price: Int!
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);

    const warnings = keySelectionSetsDeclared(schema);
    expect(warnings).toHaveLength(0);
  });

  it("warns if @key is used that isn't declared on the base service", () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          upc: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "upc") {
          sku: String! @external
          upc: String! @external
          price: Int!
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);

    const warnings = keySelectionSetsDeclared(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "KEY_NOT_DECLARED",
          "message": "[serviceB] Product -> uses the key \`upc\`, which is not declared on the base service. All keys must be declared on the base service. ",
        },
      ]
    `);
  });

  it('does not warn if the only difference is ordering of fields', () => {
    const serviceA = {
      typeDefs: gql`
        type Product
          @key(
            fields: "upc sku thing { a b product { upc sku thing { a b } } }"
          ) {
          sku: String!
          upc: String!
          thing: Thing!
        }

        type Thing {
          product: Product!
          a: String
          b: String
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product
          @key(
            fields: "upc thing { a product { thing { b a } sku upc } b } sku"
          ) {
          sku: String! @external
          upc: String! @external
          price: Int!
        }

        type Thing {
          product: Product!
          a: String
          b: String
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);

    const warnings = keySelectionSetsDeclared(schema);
    expect(warnings).toHaveLength(0);
  });

  it('warns if compound keys do not have the same fields', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "upc sku thing { a b }") {
          sku: String!
          upc: String!
          thing: Thing!
        }

        type Thing {
          product: Product!
          a: String
          b: String
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "upc sku thing { a }") {
          sku: String! @external
          upc: String! @external
          price: Int!
        }

        type Thing {
          product: Product!
          a: String
          b: String
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);

    const warnings = keySelectionSetsDeclared(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "KEY_NOT_DECLARED",
          "message": "[serviceB] Product -> uses the key \`upc sku thing { a }\`, which is not declared on the base service. All keys must be declared on the base service. ",
        },
      ]
    `);
  });

  it('does not warn if one of the multiple primary keys matches', () => {
    const serviceA = {
      typeDefs: gql`
        type Product
          @key(fields: "upc sku thing { a b }")
          @key(fields: "upc sku") {
          sku: String!
          upc: String!
          thing: Thing!
        }

        type Thing {
          product: Product!
          a: String
          b: String
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "upc sku") {
          sku: String! @external
          upc: String! @external
          price: Int!
        }

        type Thing {
          product: Product!
          a: String
          b: String
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);

    const warnings = keySelectionSetsDeclared(schema);
    expect(warnings).toHaveLength(0);
  });
});
