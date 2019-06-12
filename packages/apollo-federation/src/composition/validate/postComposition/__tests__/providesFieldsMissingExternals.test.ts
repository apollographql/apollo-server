import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { providesFieldsMissingExternal as validateProdivesFieldsMissingExternal } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('providesFieldsMissingExternal', () => {
  it('does not warn with proper @provides usage', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          upc: String!
          id: ID!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          id: ID! @external
          price: Int! @provides(fields: "id")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateProdivesFieldsMissingExternal(schema);
    expect(warnings).toEqual([]);
  });

  it('warns when there is a @provides with no matching @external field', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
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
          price: Int! @provides(fields: "id")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateProdivesFieldsMissingExternal(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "PROVIDES_FIELDS_MISSING_EXTERNAL",
          "message": "[serviceB] Product.price -> provides the field \`id\` and requires Product.id to be marked as @external.",
        },
      ]
    `);
  });
});
