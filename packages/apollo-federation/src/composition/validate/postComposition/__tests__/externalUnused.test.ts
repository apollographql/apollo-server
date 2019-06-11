import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { externalUnused as validateExternalUnused } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('externalUnused', () => {
  it('warns when there is an unused @external field', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "id") {
          sku: String!
          upc: String!
          id: ID!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product {
          sku: String! @external
          id: ID! @external
          price: Int! @requires(fields: "id")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toMatchInlineSnapshot(`
                  Array [
                    Object {
                      "code": "EXTERNAL_UNUSED",
                      "message": "[serviceB] Product.sku -> is marked as @external but is not used by a @requires, @key, or @provides directive.",
                    },
                  ]
            `);
  });

  it('does not warn when @external is selected by a @key', () => {
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
          price: Float!
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toEqual([]);
  });

  it('does not warn when @external is selected by a @requires', () => {
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
        extend type Product {
          sku: String! @external
          price: Int! @requires(fields: "sku")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toEqual([]);
  });

  it('does not warn when @external is selected by a @provides', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          id: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String! @external
          price: Int! @provides(fields: "id")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toEqual([]);
  });

  it('does not warn when @external is selected by a @provides used from a child type', () => {
    const serviceA = {
      typeDefs: gql`
        type User @key(fields: "id") {
          id: ID!
          username: String
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        type Review {
          author: User @provides(fields: "username")
        }

        type User {
          username: String @external
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toEqual([]);
  });

  it('does not warn when @external is used on type with multiple @key directives', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "upc") @key(fields: "sku") {
          upc: String
          sku: String
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "upc") {
          upc: String @external
        }
      `,
      name: 'serviceB',
    };

    const serviceC = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String @external
        }
      `,
      name: 'serviceC',
    };

    const { schema, errors } = composeServices([serviceA, serviceB, serviceC]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toEqual([]);
  });

  it('does not warn when @external is used within a nested @requires', () => {
    const serviceA = {
      name: 'serviceA',
      typeDefs: gql`
        type Product @key(fields: "id") {
          id: ID!
          flags: ProductFlags
        }

        type ProductFlags {
          isOnSale: Boolean
          isB2B: Boolean
        }
      `,
    };

    const serviceB = {
      name: 'serviceB',
      typeDefs: gql`
        extend type Product @key(fields: "id") {
          id: ID! @external
          flags: ProductFlags @external
          productPrice: Price @requires(fields: "id flags { isOnSale isB2B }")
        }

        extend type ProductFlags {
          isOnSale: Boolean @external
          isB2B: Boolean @external
        }

        type Price {
          regularPrice: Float!
          salePrice: Float!
          b2bPrice: Float!
        }
      `,
    };

    const { schema } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "EXTERNAL_UNUSED",
          "message": "[serviceB] ProductFlags.isOnSale -> is marked as @external but is not used by a @requires, @key, or @provides directive.",
        },
        Object {
          "code": "EXTERNAL_UNUSED",
          "message": "[serviceB] ProductFlags.isB2B -> is marked as @external but is not used by a @requires, @key, or @provides directive.",
        },
      ]
    `);
  });
});
