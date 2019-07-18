import { GraphQLSchema, specifiedDirectives } from 'graphql';
import { validateSDL } from 'graphql/validation/validate';
import gql from 'graphql-tag';
import { buildSchemaFromSDL } from 'apollo-graphql';
import {
  typeSerializer,
  graphqlErrorSerializer,
} from '../../../../snapshotSerializers';
import federationDirectives from '../../../../directives';
import { UniqueTypeNamesWithoutEnumsOrScalars } from '..';

expect.addSnapshotSerializer(graphqlErrorSerializer);
expect.addSnapshotSerializer(typeSerializer);

describe('UniqueTypeNamesWithoutEnumsOrScalars', () => {
  let schema: GraphQLSchema;

  // create a blank schema for each test
  beforeEach(() => {
    schema = new GraphQLSchema({
      query: undefined,
      directives: [...specifiedDirectives, ...federationDirectives],
    });
  });

  describe('enforces unique type names for', () => {
    it('object type definitions (non-identical, non-value types)', () => {
      schema = buildSchemaFromSDL(
        gql`
          type Product {
            sku: ID!
          }
        `,
        schema,
      );

      const sdl = gql`
        type Product {
          color: String!
        }
      `;

      const errors = validateSDL(sdl, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Type "Product" already exists in the schema.',
      );
    });

    it('object type definitions (non-identical, value types with type mismatch)', () => {
      schema = buildSchemaFromSDL(
        gql`
          type Product {
            sku: ID!
            color: String
            quantity: Int
          }
        `,
        schema,
      );

      const sdl = gql`
        type Product {
          sku: String!
          color: String
          quantity: Int!
        }
      `;

      const errors = validateSDL(sdl, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(2);
      expect(errors[0].message).toMatch(
        `'Product.sku' is defined as both a String! and a ID!`,
      );
      expect(errors[1].message).toMatch(
        `'Product.quantity' is defined as both a Int! and a Int`,
      );
    });

    it('object type definitions (overlapping fields, but non-value types)', () => {
      schema = buildSchemaFromSDL(
        gql`
          type Product {
            sku: ID!
            color: String
          }
        `,
        schema,
      );

      const sdl = gql`
        type Product {
          sku: ID!
          blah: Int!
        }
      `;

      const errors = validateSDL(sdl, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Type "Product" already exists in the schema.',
      );
    });

    it('invalid value types (duplicated within the same SDL)', () => {
      schema = buildSchemaFromSDL(
        gql`
          scalar Ignore
        `,
        schema,
      );

      const sdl = gql`
        type Product {
          sku: ID!
          color: String
        }

        type Product {
          sku: ID!
          color: String
        }
      `;

      const errors = validateSDL(sdl, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'There can be only one type named "Product".',
      );
    });

    it('interface definitions', () => {
      schema = buildSchemaFromSDL(
        gql`
          interface Product {
            sku: ID!
          }
        `,
        schema,
      );

      const sdl = gql`
        interface Product {
          color: String!
        }
      `;

      const errors = validateSDL(sdl, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Type "Product" already exists in the schema.',
      );
    });

    it('union definitions', () => {
      schema = buildSchemaFromSDL(
        gql`
          union UPC = String | Int
        `,
        schema,
      );

      const sdl = gql`
        union UPC = String | Int
      `;

      const errors = validateSDL(sdl, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Type "UPC" already exists in the schema.',
      );
    });

    it('input definitions', () => {
      schema = buildSchemaFromSDL(
        gql`
          input Product {
            sku: ID
          }
        `,
        schema,
      );

      const sdl = gql`
        input Product {
          color: String!
        }
      `;

      const errors = validateSDL(sdl, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Type "Product" already exists in the schema.',
      );
    });
  });

  describe('permits duplicate type names for', () => {
    it('scalar types', () => {
      schema = buildSchemaFromSDL(
        gql`
          scalar JSON
        `,
        schema,
      );

      const definitions = gql`
        scalar JSON
      `;

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(0);
    });

    it('enum types (congruency enforced in other validations)', () => {
      schema = buildSchemaFromSDL(
        gql`
          enum Category {
            Furniture
            Supplies
          }
        `,
        schema,
      );

      const definitions = gql`
        enum Category {
          Things
        }
      `;

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(0);
    });

    it('input types', () => {
      schema = buildSchemaFromSDL(
        gql`
          input Product {
            sku: ID
          }
        `,
        schema,
      );

      const definitions = gql`
        input Product {
          sku: ID
        }
      `;

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(0);
    });

    it('value types (non-entity type definitions that are identical)', () => {
      schema = buildSchemaFromSDL(
        gql`
          type Product {
            sku: ID
          }
        `,
        schema,
      );

      const definitions = gql`
        type Product {
          sku: ID
        }
      `;

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('value types must be of the same kind', () => {
      schema = buildSchemaFromSDL(
        gql`
          input Product {
            sku: ID
          }
        `,
        schema,
      );

      const definitions = gql`
        type Product {
          sku: ID
        }
      `;

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Type "Product" already exists in the schema.',
      );
    });

    it('value types cannot be entities (part 1)', () => {
      schema = buildSchemaFromSDL(
        gql`
          type Product @key(fields: "") {
            sku: ID
          }
        `,
        schema,
      );

      const definitions = gql`
        type Product {
          sku: ID
        }
      `;

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Type "Product" already exists in the schema.',
      );
    });

    it('value types cannot be entities (part 2)', () => {
      schema = buildSchemaFromSDL(
        gql`
          type Product {
            sku: ID
          }
        `,
        schema,
      );

      const definitions = gql`
        type Product @key(fields: "") {
          sku: ID
        }
      `;

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Type "Product" already exists in the schema.',
      );
    });
  });
});
