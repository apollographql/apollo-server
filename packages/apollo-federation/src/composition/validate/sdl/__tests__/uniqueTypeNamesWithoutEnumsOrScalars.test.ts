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
import { UniqueTypeNamesWithoutEnumsOrScalars } from '..';
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
        UniqueTypeNamesWithoutEnumsOrScalars,
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
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(2);
      expect(errors).toMatchInlineSnapshot(`
        Array [
          Object {
            "code": "VALUE_TYPE_FIELD_TYPE_MISMATCH",
            "message": "Found field type mismatch on expected value type. 'Product.sku' is defined as both a String! and a ID!. In order to define 'Product' in multiple places, the fields and their types must be identical.",
          },
          Object {
            "code": "VALUE_TYPE_FIELD_TYPE_MISMATCH",
            "message": "Found field type mismatch on expected value type. 'Product.quantity' is defined as both a Int! and a Int. In order to define 'Product' in multiple places, the fields and their types must be identical.",
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
        UniqueTypeNamesWithoutEnumsOrScalars,
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
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(
        'There can be only one type named "Product".',
      );
    });

    it('union definitions', () => {
      const [definitions] = createDocumentsForServices([
        {
          typeDefs: gql`
            union UPC = String | Int
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            union UPC = String | Int | Boolean
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchInlineSnapshot(`
        Object {
          "code": "VALUE_TYPE_UNION_TYPES_MISMATCH",
          "message": "The union 'UPC' is defined in multiple places, however the unioned types do not match. Union types with the same name must also consist of identical types. The type Boolean is mismatched.",
        }
      `);
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
        UniqueTypeNamesWithoutEnumsOrScalars,
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
        UniqueTypeNamesWithoutEnumsOrScalars,
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
        UniqueTypeNamesWithoutEnumsOrScalars,
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
        UniqueTypeNamesWithoutEnumsOrScalars,
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
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(0);
    });

    it('identical union types', () => {
      const [definitions] = createDocumentsForServices([
        {
          typeDefs: gql`
            union UPC = String | Int
          `,
          name: 'serviceA',
        },
        {
          typeDefs: gql`
            union UPC = String | Int
          `,
          name: 'serviceB',
        },
      ]);

      const errors = validateSDL(definitions, schema, [
        UniqueTypeNamesWithoutEnumsOrScalars,
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
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors[0]).toMatchInlineSnapshot(`
        Object {
          "code": "VALUE_TYPE_KIND_MISMATCH",
          "message": "Found kind mismatch on expected value type. 'Product' is defined as both a ObjectTypeDefinition and a InputObjectTypeDefinition. In order to define Product in multiple places, the kinds must be identical.",
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
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchInlineSnapshot(`
        Object {
          "code": "VALUE_TYPE_NO_ENTITY",
          "message": "Value types cannot be entities (using the @key directive). Please ensure that one type extends the other correctly, or remove the @key directive if this is not an entity.",
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
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchInlineSnapshot(`
        Object {
          "code": "VALUE_TYPE_NO_ENTITY",
          "message": "Value types cannot be entities (using the @key directive). Please ensure that one type extends the other correctly, or remove the @key directive if this is not an entity.",
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
        UniqueTypeNamesWithoutEnumsOrScalars,
      ]);
      expect(errors).toHaveLength(0);
    });
  });
});
