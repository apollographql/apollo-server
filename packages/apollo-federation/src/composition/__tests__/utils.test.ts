import gql from 'graphql-tag';
import deepFreeze from 'deep-freeze';
import { stripExternalFieldsFromTypeDefs } from '../utils';
import { astSerializer } from '../../snapshotSerializers';

expect.addSnapshotSerializer(astSerializer);

describe('Composition utility functions', () => {
  describe('stripExternalFieldsFromTypeDefs', () => {
    it('returns a new DocumentNode with @external fields removed as well as information about the removed fields', () => {
      const typeDefs = gql`
        type Query {
          product: Product
        }

        extend type Product @key(fields: "sku") {
          sku: String @external
        }

        type Mutation {
          updateProduct: Product
        }

        extend interface Account @key(fields: "id") {
          id: ID! @external
        }
      `;

      const {
        typeDefsWithoutExternalFields,
        strippedFields,
      } = stripExternalFieldsFromTypeDefs(typeDefs, 'serviceA');

      expect(typeDefsWithoutExternalFields).toMatchInlineSnapshot(`
        type Query {
          product: Product
        }

        extend type Product @key(fields: "sku")

        type Mutation {
          updateProduct: Product
        }

        extend interface Account @key(fields: "id")
      `);

      expect(strippedFields).toMatchInlineSnapshot(`
                Array [
                  Object {
                    "field": sku: String @external,
                    "parentTypeName": "Product",
                    "serviceName": "serviceA",
                  },
                  Object {
                    "field": id: ID! @external,
                    "parentTypeName": "Account",
                    "serviceName": "serviceA",
                  },
                ]
            `);
    });

    it("doesn't mutate the input DocumentNode", () => {
      const typeDefs = gql`
        type Query {
          product: Product
        }

        extend type Product @key(fields: "sku") {
          sku: String @external
        }

        type Mutation {
          updateProduct: Product
        }
      `;

      deepFreeze(typeDefs);

      // Assert that mutation does, in fact, throw
      expect(() => (typeDefs.blah = [])).toThrow();
      expect(() =>
        stripExternalFieldsFromTypeDefs(typeDefs, 'serviceA'),
      ).not.toThrow();
    });
  });
});
