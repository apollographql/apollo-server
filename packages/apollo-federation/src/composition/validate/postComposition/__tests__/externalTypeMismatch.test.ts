import gql from 'graphql-tag';
import { externalTypeMismatch as validateExternalTypeMismatch } from '../';
import { composeServices } from '../../../compose';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('validateExternalDirectivesOnSchema', () => {
  it('warns when the type of an @external field doesnt match the base', () => {
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
          sku: String @external
          price: Int! @requires(fields: "sku")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalTypeMismatch(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "EXTERNAL_TYPE_MISMATCH",
          "message": "[serviceB] Product.sku -> Type \`String\` does not match the type of the original field in serviceA (\`String!\`)",
        },
      ]
    `);
  });

  it("warns when an @external field's type does not exist in the composed schema", () => {
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
          sku: NonExistentType! @external
          id: String! @requires(fields: "sku")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalTypeMismatch(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "EXTERNAL_TYPE_MISMATCH",
          "message": "[serviceB] Product.sku -> the type of the @external field does not exist in the resulting composed schema",
        },
      ]
    `);
  });
});
