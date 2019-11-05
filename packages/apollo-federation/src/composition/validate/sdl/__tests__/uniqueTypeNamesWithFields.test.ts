import {
  GraphQLSchema,
  specifiedDirectives,
  Kind,
  DocumentNode,
} from 'graphql';
import { validateSDL } from 'graphql/validation/validate';
import gql from 'graphql-tag';
import {
  typeSerializer,
  graphqlErrorSerializer,
} from '../../../../snapshotSerializers';
import federationDirectives from '../../../../directives';
import { UniqueTypeNamesWithFields } from '..';
import { ServiceDefinition } from '../../../types';
import { buildMapsFromServiceList } from '../../../compose';

expect.addSnapshotSerializer(graphqlErrorSerializer);
expect.addSnapshotSerializer(typeSerializer);

function createDocumentsForServices(
  serviceList: ServiceDefinition[],
): DocumentNode[] {
  const { definitionsMap, extensionsMap } = buildMapsFromServiceList(
    serviceList,
  );
  return [
    {
      kind: Kind.DOCUMENT,
      definitions: Object.values(definitionsMap).flat(),
    },
    {
      kind: Kind.DOCUMENT,
      definitions: Object.values(extensionsMap).flat(),
    },
  ];
}

describe('UniqueTypeNamesWithFields', () => {
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
      const [definitions] = createDocumentsForServices([
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
            type Product {
              color: String!
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithFields,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'There can be only one type named "Product".',
      );
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
        UniqueTypeNamesWithFields,
      ]);
      expect(errors).toHaveLength(2);
      expect(errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "code": "VALUE_TYPE_FIELD_TYPE_MISMATCH",
            "message": "[serviceA] Product.sku -> A field was defined differently in different services. \`serviceA\` and \`serviceB\` define \`Product.sku\` as a ID! and String! respectively. In order to define \`Product\` in multiple places, the fields and their types must be identical.",
          },
          Object {
            "code": "VALUE_TYPE_FIELD_TYPE_MISMATCH",
            "message": "[serviceA] Product.quantity -> A field was defined differently in different services. \`serviceA\` and \`serviceB\` define \`Product.quantity\` as a Int and Int! respectively. In order to define \`Product\` in multiple places, the fields and their types must be identical.",
          },
        ]
      `);
    });

    it('object type definitions (overlapping fields, but non-value types)', () => {
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
              blah: Int!
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithFields,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'There can be only one type named "Product".',
      );
    });

    it('interface definitions', () => {
      const [definitions] = createDocumentsForServices([
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
            interface Product {
              color: String!
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithFields,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'There can be only one type named "Product".',
      );
    });

    it('input definitions', () => {
      const [definitions] = createDocumentsForServices([
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
            input Product {
              color: String!
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithFields,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'There can be only one type named "Product".',
      );
    });
  });

  describe('permits duplicate type names for', () => {
    it('scalar types', () => {
      const [definitions] = createDocumentsForServices([
        {
          typeDefs: gql`
            scalar JSON
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            scalar JSON
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithFields,
      ]);
      expect(errors).toHaveLength(0);
    });

    it('enum types (congruency enforced in other validations)', () => {
      const [definitions] = createDocumentsForServices([
        {
          typeDefs: gql`
            enum Category {
              Furniture
              Supplies
            }
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            enum Category {
              Things
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithFields,
      ]);
      expect(errors).toHaveLength(0);
    });

    it('input types', () => {
      const [definitions] = createDocumentsForServices([
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
            input Product {
              sku: ID
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithFields,
      ]);
      expect(errors).toHaveLength(0);
    });

    it('value types (non-entity type definitions that are identical)', () => {
      const [definitions] = createDocumentsForServices([
        {
          typeDefs: gql`
            type Product {
              sku: ID
            }
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            type Product {
              sku: ID
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithFields,
      ]);
      expect(errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('value types must be of the same kind', () => {
      const [definitions] = createDocumentsForServices([
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
            type Product {
              sku: ID
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithFields,
      ]);
      expect(errors[0]).toMatchInlineSnapshot(`
                Object {
                  "code": "VALUE_TYPE_KIND_MISMATCH",
                  "message": "[serviceA] Product -> Found kind mismatch on expected value type belonging to services \`serviceA\` and \`serviceB\`. \`Product\` is defined as both a \`ObjectTypeDefinition\` and a \`InputObjectTypeDefinition\`. In order to define \`Product\` in multiple places, the kinds must be identical.",
                }
            `);
    });

    it('value types cannot be entities (part 1)', () => {
      const [definitions] = createDocumentsForServices([
        {
          typeDefs: gql`
            type Product @key(fields: "sku") {
              sku: ID
            }
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            type Product {
              sku: ID
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithFields,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchInlineSnapshot(`
                Object {
                  "code": "VALUE_TYPE_NO_ENTITY",
                  "message": "[serviceA] Product -> Value types cannot be entities (using the \`@key\` directive). Please ensure that the \`Product\` type is extended properly or remove the \`@key\` directive if this is not an entity.",
                }
            `);
    });

    it('value types cannot be entities (part 2)', () => {
      const [definitions] = createDocumentsForServices([
        {
          typeDefs: gql`
            type Product {
              sku: ID
            }
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            type Product @key(fields: "sku") {
              sku: ID
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithFields,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchInlineSnapshot(`
                Object {
                  "code": "VALUE_TYPE_NO_ENTITY",
                  "message": "[serviceB] Product -> Value types cannot be entities (using the \`@key\` directive). Please ensure that the \`Product\` type is extended properly or remove the \`@key\` directive if this is not an entity.",
                }
            `);
    });

    it('no false positives for properly formed entities (that look like value types)', () => {
      const [definitions] = createDocumentsForServices([
        {
          typeDefs: gql`
            type Product @key(fields: "sku") {
              sku: ID
            }
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            extend type Product @key(fields: "sku") {
              sku: ID @external
            }
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithFields,
      ]);
      expect(errors).toHaveLength(0);
    });
  });
});
