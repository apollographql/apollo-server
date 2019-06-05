import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { keyFieldsMissingOnBase as validateKeyFieldsMissingOnBase } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('keyFieldsMissingOnBase', () => {
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

    const warnings = validateKeyFieldsMissingOnBase(schema);
    expect(warnings).toHaveLength(0);
  });

  it('warns if @key references a field added by another service', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku uid") {
          sku: String!
          upc: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product {
          uid: String!
          sku: String! @external
          price: Int! @requires(fields: "sku")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);

    const warnings = validateKeyFieldsMissingOnBase(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "KEY_FIELDS_MISSING_ON_BASE",
          "message": "[serviceA] Product -> A @key selects uid, but Product.uid was either created or overwritten by serviceB, not serviceA",
        },
      ]
    `);
  });

  // FIXME: shouldn't composition _allow_ this with a warning?
  // right now, it errors during composition
  xit('warns if @key references a field that was overwritten', () => {
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
        extend type Product {
          sku: ID! # overwritten from base service
          weight: Float!
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);

    const warnings = validateKeyFieldsMissingOnBase(schema);
    expect(warnings).toMatchInlineSnapshot();
  });
});
