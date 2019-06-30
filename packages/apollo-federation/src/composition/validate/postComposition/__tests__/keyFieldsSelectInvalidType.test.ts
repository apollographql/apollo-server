import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { keyFieldsSelectInvalidType as validateKeyFieldsSelectInvalidType } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('keyFieldsSelectInvalidType', () => {
  it('returns no warnings with proper @key usage', () => {
    const serviceA = {
      // FIXME: add second key "upc" when duplicate directives are supported
      // i.e. @key(fields: "sku") @key(fields: "upc")
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          upc: String!
          color: Color!
        }

        type Color {
          id: ID!
          value: String!
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
    expect(errors).toHaveLength(0);

    const warnings = validateKeyFieldsSelectInvalidType(schema);
    expect(warnings).toHaveLength(0);
  });

  it('warns if @key references fields of an interface type', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "featuredItem") {
          featuredItem: Node!
          sku: String!
        }

        interface Node {
          id: ID!
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
    expect(errors).toHaveLength(0);

    const warnings = validateKeyFieldsSelectInvalidType(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "KEY_FIELDS_SELECT_INVALID_TYPE",
          "message": "[serviceA] Product -> A @key selects Product.featuredItem, which is an interface type. Keys cannot select interfaces.",
        },
      ]
    `);
  });

  it('warns if @key references fields of a union type', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "price") {
          sku: String!
          price: Numeric!
        }

        union Numeric = Float | Int
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product {
          sku: String! @external
          name: String!
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);

    const warnings = validateKeyFieldsSelectInvalidType(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "KEY_FIELDS_SELECT_INVALID_TYPE",
          "message": "[serviceA] Product -> A @key selects Product.price, which is a union type. Keys cannot select union types.",
        },
      ]
    `);
  });
});
