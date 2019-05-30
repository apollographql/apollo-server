import gql from 'graphql-tag';
import { externalUsedOnBase as validateExternalUsedOnBase } from '../';
import { GraphQLObjectType } from 'graphql';

describe('externalUsedOnBase', () => {
  it('does not warn when no externals directives are defined', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "color { id value }") {
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

    const warnings = validateExternalUsedOnBase(serviceA);
    expect(warnings).toEqual([]);
  });
  it('warns when there is a @external field on a base type', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          upc: String! @external
          id: ID!
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateExternalUsedOnBase(serviceA);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        [GraphQLError: [serviceA] Product.upc -> Found extraneous @external directive. @external cannot be used on base types.],
      ]
    `);
  });
});
