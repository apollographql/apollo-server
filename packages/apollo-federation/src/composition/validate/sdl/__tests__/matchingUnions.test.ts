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

describe('MatchingUnions', () => {
  let schema: GraphQLSchema;

  // create a blank schema for each test
  beforeEach(() => {
    schema = new GraphQLSchema({
      query: undefined,
      directives: [...specifiedDirectives, ...federationDirectives],
    });
  });

  it('enforces unique union names', () => {
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

    const errors = validateSDL(definitions, schema, [UniqueUnionTypes]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchInlineSnapshot(`
      Object {
        "code": "VALUE_TYPE_UNION_TYPES_MISMATCH",
        "message": "[serviceA] UPC -> The union \`UPC\` is defined in services \`serviceA\` and \`serviceB\`, however their types do not match. Union types with the same name must also consist of identical types. The type Boolean is mismatched.",
      }
    `);
  });

  it('permits duplicate union names for identical union types', () => {
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

    const errors = validateSDL(definitions, schema, [UniqueUnionTypes]);
    expect(errors).toHaveLength(0);
  });
});
