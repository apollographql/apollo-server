import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { requiresFieldsMissingExternal as validateRequiresFieldsMissingExternal } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('requiresFieldsMissingExternal', () => {
  it('does not warn with proper @requires usage', () => {
    const serviceA = {
      typeDefs: gql`
        type Product {
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
          id: ID! @external
          price: Int! @requires(fields: "id")
        }
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema } = composeServices(serviceList);
    const warnings = validateRequiresFieldsMissingExternal({
      schema,
      serviceList,
    });
    expect(warnings).toEqual([]);
  });

  it('warns when there is a @requires with no matching @external field', () => {
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
          price: Int! @requires(fields: "id")
        }
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema } = composeServices(serviceList);
    const warnings = validateRequiresFieldsMissingExternal({
      schema,
      serviceList,
    });
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "REQUIRES_FIELDS_MISSING_EXTERNAL",
          "message": "[serviceB] Product.price -> requires the field \`id\` to be marked as @external.",
        },
      ]
    `);
  });
});
