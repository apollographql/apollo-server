import {
  Kind,
  DocumentNode,
  GraphQLSchema,
  specifiedDirectives,
  extendSchema,
} from 'graphql';
import { validateSDL } from 'graphql/validation/validate';
import gql from 'graphql-tag';

import { buildMapsFromServiceList } from '../../../compose';
import {
  typeSerializer,
  graphqlErrorSerializer,
} from '../../../../snapshotSerializers';
import federationDirectives from '../../../../directives';
import { ServiceDefinition } from '../../../types';
import { PossibleTypeExtensions } from '../possibleTypeExtensions';

expect.addSnapshotSerializer(graphqlErrorSerializer);
expect.addSnapshotSerializer(typeSerializer);

// simulate the first half of the composition process
const createDefinitionsDocumentForServices = (
  serviceList: ServiceDefinition[],
): {
  definitions: DocumentNode;
  extensions: DocumentNode;
} => {
  const { definitionsMap, extensionsMap } = buildMapsFromServiceList(
    serviceList,
  );
  return {
    definitions: {
      kind: Kind.DOCUMENT,
      definitions: Object.values(definitionsMap).flat(),
    },
    extensions: {
      kind: Kind.DOCUMENT,
      definitions: Object.values(extensionsMap).flat(),
    },
  };
};

describe('PossibleTypeExtensionsType', () => {
  let schema: GraphQLSchema;

  // create a blank schema for each test
  beforeEach(() => {
    schema = new GraphQLSchema({
      query: undefined,
      directives: [...specifiedDirectives, ...federationDirectives],
    });
  });

  it('does not error with matching enums across services', () => {
    const serviceList = [
      {
        typeDefs: gql`
          extend type Product {
            sku: ID
          }
        `,
        name: 'serviceA',
      },

      {
        typeDefs: gql`
          type Product {
            id: ID!
          }
        `,
        name: 'serviceB',
      },
    ];

    const { definitions, extensions } = createDefinitionsDocumentForServices(
      serviceList,
    );
    const errors = validateSDL(definitions, schema, [PossibleTypeExtensions]);
    schema = extendSchema(schema, definitions, { assumeValidSDL: true });
    errors.push(...validateSDL(extensions, schema, [PossibleTypeExtensions]));
    expect(errors).toHaveLength(0);
  });

  it('errors when there is an extension with no base', () => {
    const serviceList = [
      {
        typeDefs: gql`
          extend type Product {
            id: ID!
          }
        `,
        name: 'serviceA',
      },
    ];

    const { definitions, extensions } = createDefinitionsDocumentForServices(
      serviceList,
    );
    const errors = validateSDL(definitions, schema, [PossibleTypeExtensions]);
    schema = extendSchema(schema, definitions, { assumeValidSDL: true });
    errors.push(...validateSDL(extensions, schema, [PossibleTypeExtensions]));

    expect(errors).toHaveLength(1);
    expect(errors).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "EXTENSION_WITH_NO_BASE",
          "message": "[serviceA] Product -> \`Product\` is an extension type, but \`Product\` is not defined in any service",
        },
      ]
    `);
  });

  it('errors when trying to extend a type with a different `Kind`', () => {
    const serviceList = [
      {
        typeDefs: gql`
          extend type Product {
            sku: ID
          }
        `,
        name: 'serviceA',
      },

      {
        typeDefs: gql`
          input Product {
            id: ID!
          }
        `,
        name: 'serviceB',
      },
    ];

    const { definitions, extensions } = createDefinitionsDocumentForServices(
      serviceList,
    );
    const errors = validateSDL(definitions, schema, [PossibleTypeExtensions]);
    schema = extendSchema(schema, definitions, { assumeValidSDL: true });
    errors.push(...validateSDL(extensions, schema, [PossibleTypeExtensions]));
    expect(errors).toMatchInlineSnapshot(`
            Array [
              Object {
                "code": "EXTENSION_OF_WRONG_KIND",
                "message": "[serviceA] Product -> \`Product\` was originally defined as a InputObjectTypeDefinition and can only be extended by a InputObjectTypeExtension. serviceA defines Product as a ObjectTypeExtension",
              },
            ]
        `);
  });

  it('does not error', () => {
    const serviceList = [
      {
        typeDefs: gql`
          extend interface Product {
            name: String
          }
          extend type Book implements Product {
            sku: ID!
            name: String
          }
        `,
        name: 'serviceA',
      },

      {
        typeDefs: gql`
          type Book {
            id: ID!
          }

          interface Product {
            sku: ID!
          }
        `,
        name: 'serviceB',
      },
    ];

    const { definitions, extensions } = createDefinitionsDocumentForServices(
      serviceList,
    );
    const errors = validateSDL(definitions, schema, [PossibleTypeExtensions]);
    schema = extendSchema(schema, definitions, { assumeValidSDL: true });
    errors.push(...validateSDL(extensions, schema, [PossibleTypeExtensions]));
    schema = extendSchema(schema, extensions, { assumeValidSDL: true });

    expect(schema.getType('Book')).toMatchInlineSnapshot(`
                  type Book implements Product {
                    id: ID!
                    sku: ID!
                    name: String
                  }
            `);
    expect(errors).toHaveLength(0);
  });
});
