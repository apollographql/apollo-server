import {
  GraphQLSchema,
  specifiedDirectives,
  DocumentNode,
  Kind,
  extendSchema,
} from 'graphql';
import { validateSDL } from 'graphql/validation/validate';
import gql from 'graphql-tag';
import { typeSerializer } from '../../../../snapshotSerializers';
import { buildMapsFromServiceList } from '../../../compose';
import federationDirectives from '../../../../directives';
import { UniqueFieldDefinitionNames } from '..';
import { ServiceDefinition } from '../../../types';

expect.addSnapshotSerializer(typeSerializer);

// simulate the first half of the composition process
function createDocumentsForServices(
  serviceList: ServiceDefinition[],
): DocumentNode[] {
  const { typeDefinitionsMap, typeExtensionsMap } = buildMapsFromServiceList(
    serviceList,
  );
  return [
    {
      kind: Kind.DOCUMENT,
      definitions: Object.values(typeDefinitionsMap).flat(),
    },
    {
      kind: Kind.DOCUMENT,
      definitions: Object.values(typeExtensionsMap).flat(),
    },
  ];
}

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
      const [definitions, extensions] = createDocumentsForServices([
        {
          typeDefs: gql`
            type Product {
              sku: ID!
            }
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            extend type Product {
              sku: Int!
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueFieldDefinitionNames,
      ]);
      schema = extendSchema(schema, definitions, {
        assumeValidSDL: true,
      });

      errors.push(
        ...validateSDL(extensions, schema, [UniqueFieldDefinitionNames]),
      );

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Field "Product.sku" already exists in the schema.',
      );
    });

    it('interface definitions', () => {
      const [definitions, extensions] = createDocumentsForServices([
        {
          typeDefs: gql`
            interface Product {
              sku: ID!
            }
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            extend interface Product {
              sku: String!
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueFieldDefinitionNames,
      ]);
      schema = extendSchema(schema, definitions, { assumeValidSDL: true });
      errors.push(
        ...validateSDL(extensions, schema, [UniqueFieldDefinitionNames]),
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Field "Product.sku" already exists in the schema.',
      );
    });

    it('input object definitions', () => {
      const [definitions, extensions] = createDocumentsForServices([
        {
          typeDefs: gql`
            input Product {
              sku: ID
            }
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            extend input Product {
              sku: String!
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueFieldDefinitionNames,
      ]);
      schema = extendSchema(schema, definitions, { assumeValidSDL: true });
      errors.push(
        ...validateSDL(extensions, schema, [UniqueFieldDefinitionNames]),
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'Field "Product.sku" already exists in the schema.',
      );
    });
  });

  describe('permits duplicate field names for', () => {
    it('value types (identical object types)', () => {
      const [definitions] = createDocumentsForServices([
        {
          typeDefs: gql`
            type Product {
              sku: ID!
              color: String
            }
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            type Product {
              sku: ID!
              color: String
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueFieldDefinitionNames,
      ]);
      expect(errors).toHaveLength(0);
    });

    it('value types (identical interface types)', () => {
      const [definitions] = createDocumentsForServices([
        {
          typeDefs: gql`
            interface Product {
              sku: ID!
              color: String
            }
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            interface Product {
              sku: ID!
              color: String
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueFieldDefinitionNames,
      ]);
      expect(errors).toHaveLength(0);
    });

    it('value types (identical input types)', () => {
      const [definitions] = createDocumentsForServices([
        {
          typeDefs: gql`
            input Product {
              sku: ID!
              color: String
            }
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            input Product {
              sku: ID!
              color: String
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueFieldDefinitionNames,
      ]);
      expect(errors).toHaveLength(0);
    });

    it('object type definitions (non-identical, value types with type mismatch)', () => {
      const [definitions] = createDocumentsForServices([
        {
          typeDefs: gql`
            type Product {
              sku: ID!
              color: String
              quantity: Int
            }
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            type Product {
              sku: String!
              color: String
              quantity: Int!
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueFieldDefinitionNames,
      ]);
      expect(errors).toHaveLength(0);
    });
  });
});
