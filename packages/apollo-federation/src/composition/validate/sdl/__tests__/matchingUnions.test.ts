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
import { UniqueUnionTypes } from '..';
import { ServiceDefinition } from '../../../types';
import { buildMapsFromServiceList } from '../../../compose';
import federationDirectives from '../../../../directives';

expect.addSnapshotSerializer(graphqlErrorSerializer);
expect.addSnapshotSerializer(typeSerializer);

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

describe('MatchingUnions', () => {
  let schema: GraphQLSchema;

  // create a blank schema for each test
  beforeEach(() => {
    schema = new GraphQLSchema({
      query: undefined,
      directives: [...specifiedDirectives, ...federationDirectives],
    });
  });

  it('enforces unique union names on non-identical union types', () => {
    const [definitions] = createDocumentsForServices([
      {
        typeDefs: gql`
          union ProductOrError = Product | Error

          type Error {
            code: Int!
            message: String!
          }

          type Product @key(fields: "sku") {
            sku: ID!
          }
        `,
        name: 'serviceA',
      },
      {
        typeDefs: gql`
          union ProductOrError = Product

          type Error {
            code: Int!
            message: String!
          }

          extend type Product @key(fields: "sku") {
            sku: ID! @external
            colors: [String]
          }
        `,
        name: 'serviceB',
      },
    ]);

    const errors = validateSDL(definitions, schema, [UniqueUnionTypes]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchInlineSnapshot(`
      Object {
        "code": "VALUE_TYPE_UNION_TYPES_MISMATCH",
        "message": "[serviceA] ProductOrError -> The union \`ProductOrError\` is defined in services \`serviceA\` and \`serviceB\`, however their types do not match. Union types with the same name must also consist of identical types. The type Error is mismatched.",
      }
    `);
  });

  it('permits duplicate union names for identical union types', () => {
    const [definitions] = createDocumentsForServices([
      {
        typeDefs: gql`
          union ProductOrError = Product | Error

          type Error {
            code: Int!
            message: String!
          }

          type Product @key(fields: "sku") {
            sku: ID!
          }
        `,
        name: 'serviceA',
      },
      {
        typeDefs: gql`
          union ProductOrError = Product | Error

          type Error {
            code: Int!
            message: String!
          }

          type Product @key(fields: "sku") {
            sku: ID!
          }
        `,
        name: 'serviceB',
      },
    ]);

    const errors = validateSDL(definitions, schema, [UniqueUnionTypes]);
    expect(errors).toHaveLength(0);
  });
});
