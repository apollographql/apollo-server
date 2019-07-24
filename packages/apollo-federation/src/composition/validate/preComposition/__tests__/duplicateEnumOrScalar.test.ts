import gql from 'graphql-tag';
import { duplicateEnumOrScalar as validateDuplicateEnumOrScalar } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('duplicateEnumOrScalar', () => {
  it('does not error with proper enum and scalar usage', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "color { id value }") {
          sku: String!
          upc: String!
          shippingDate: Date
          type: ProductType
        }

        enum ProductType {
          BOOK
          FURNITURE
        }

        extend enum ProductType {
          DIGITAL
        }

        scalar Date
      `,
      name: 'serviceA',
    };

    const warnings = validateDuplicateEnumOrScalar(serviceA);
    expect(warnings).toEqual([]);
  });
  it('errors when there are multiple definitions of the same enum', () => {
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

        enum ProductType {
          BOOK
          FURNITURE
        }

        enum ProductType {
          DIGITAL
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateDuplicateEnumOrScalar(serviceA);
    expect(warnings).toMatchInlineSnapshot(`
            Array [
              Object {
                "code": "DUPLICATE_ENUM_DEFINITION",
                "message": "[serviceA] ProductType -> The enum, \`ProductType\` was defined multiple times in this service. Remove one of the definitions for \`ProductType\`",
              },
            ]
        `);
  });

  it('errors when there are multiple definitions of the same scalar', () => {
    const serviceA = {
      typeDefs: gql`
        scalar Date
        type Product @key(fields: "color { id value }") {
          sku: String!
          upc: String!
          deliveryDate: Date
        }

        scalar Date
      `,
      name: 'serviceA',
    };

    const warnings = validateDuplicateEnumOrScalar(serviceA);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "DUPLICATE_SCALAR_DEFINITION",
          "message": "[serviceA] Date -> The scalar, \`Date\` was defined multiple times in this service. Remove one of the definitions for \`Date\`",
        },
      ]
    `);
  });
});
