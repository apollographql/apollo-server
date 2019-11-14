import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { requiresFieldsMissingOnBase as validateRequiresFieldsMissingOnBase } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('requiresFieldsMissingOnBase', () => {
  it('does not warn with proper @requires usage', () => {
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
          id: ID!
          weight: Float! @requires(fields: "sku")
        }
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema } = composeServices(serviceList);
    const warnings = validateRequiresFieldsMissingOnBase({
      schema,
      serviceList,
    });
    expect(warnings).toEqual([]);
  });

  it('warns when requires selects a field not found on the base type', () => {
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
          id: ID!
        }
      `,
      name: 'serviceB',
    };
    const serviceC = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          id: ID! @external
          weight: Float! @requires(fields: "id")
        }
      `,
      name: 'serviceC',
    };
    const serviceList = [serviceA, serviceB, serviceC];
    const { schema } = composeServices(serviceList);
    const warnings = validateRequiresFieldsMissingOnBase({
      schema,
      serviceList,
    });
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "REQUIRES_FIELDS_MISSING_ON_BASE",
          "message": "[serviceC] Product.weight -> requires the field \`id\` to be @external. @external fields must exist on the base type, not an extension.",
        },
      ]
    `);
  });
});
