import { GraphQLSchema, specifiedDirectives } from 'graphql';
import { validateSDL } from 'graphql/validation/validate';
import gql from 'graphql-tag';
import { buildSchemaFromSDL } from 'apollo-graphql';
import {
  typeSerializer,
  graphqlErrorSerializer,
} from '../../../../snapshotSerializers';
import federationDirectives from '../../../../directives';
import { UniqueFieldDefinitionNames } from '..';

expect.addSnapshotSerializer(graphqlErrorSerializer);
expect.addSnapshotSerializer(typeSerializer);

describe('UniqueFieldDefinitionNames', () => {
  let schema: GraphQLSchema;

  // create a blank schema for each test
  beforeEach(() => {
    schema = new GraphQLSchema({
      query: undefined,
      directives: [...specifiedDirectives, ...federationDirectives],
    });
  });

  describe('enforces unique field names for', () => {
    it('object type definitions', () => {
      schema = buildSchemaFromSDL(
        gql`
          type Product {
            sku: ID!
          }
        `,
        schema,
      );

      const sdl = gql`
        extend type Product {
          sku: Int!
        }
      `;

      const errors = validateSDL(sdl, schema, [UniqueFieldDefinitionNames]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Field "Product.sku" already exists in the schema.',
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
        extend interface Product {
          sku: String!
        }
      `;

      const errors = validateSDL(sdl, schema, [UniqueFieldDefinitionNames]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Field "Product.sku" already exists in the schema.',
      );
    });

    it('input object definitions', () => {
      schema = buildSchemaFromSDL(
        gql`
          input Product {
            sku: ID
          }
        `,
        schema,
      );

      const sdl = gql`
        extend input Product {
          sku: String!
        }
      `;

      const errors = validateSDL(sdl, schema, [UniqueFieldDefinitionNames]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Field "Product.sku" already exists in the schema.',
      );
    });
  });

  describe('permits duplicate field names for', () => {
    it('value types (identical object types)', () => {
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
          color: String
        }
      `;

      const errors = validateSDL(sdl, schema, [UniqueFieldDefinitionNames]);
      expect(errors).toHaveLength(0);
    });

    it('value types (identical interface types)', () => {
      schema = buildSchemaFromSDL(
        gql`
          interface Product {
            sku: ID!
            color: String
          }
        `,
        schema,
      );

      const sdl = gql`
        interface Product {
          sku: ID!
          color: String
        }
      `;

      const errors = validateSDL(sdl, schema, [UniqueFieldDefinitionNames]);
      expect(errors).toHaveLength(0);
    });

    it('value types (identical input types)', () => {
      schema = buildSchemaFromSDL(
        gql`
          input Product {
            sku: ID!
            color: String
          }
        `,
        schema,
      );

      const sdl = gql`
        input Product {
          sku: ID!
          color: String
        }
      `;

      const errors = validateSDL(sdl, schema, [UniqueFieldDefinitionNames]);
      expect(errors).toHaveLength(0);
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

      const errors = validateSDL(sdl, schema, [UniqueFieldDefinitionNames]);
      expect(errors).toHaveLength(0);
    });
  });
});
