import gql from 'graphql-tag';
import { rootFieldUsed as validateRootFieldUsed } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('rootFieldUsed', () => {
  it('has no warnings when no schema definition or extension is provided', () => {
    const serviceA = {
      typeDefs: gql`
        type Query {
          product: Product
        }

        type Product {
          sku: String
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateRootFieldUsed(serviceA);
    expect(warnings).toHaveLength(0);
  });

  it('has no warnings when a schema definition / extension is provided, when no default root operation type names are used', () => {
    const schemaDefinition = {
      typeDefs: gql`
        schema {
          query: RootQuery
        }

        type RootQuery {
          product: Product
        }

        type Product {
          sku: String
        }
      `,
      name: 'schemaDefinition',
    };

    const schemaExtension = {
      typeDefs: gql`
        extend schema {
          query: RootQuery
        }

        type RootQuery {
          product: Product
        }

        type Product {
          sku: String
        }
      `,
      name: 'schemaExtension',
    };

    const schemaDefinitionWarnings = validateRootFieldUsed(schemaDefinition);
    const schemaExtensionWarnings = validateRootFieldUsed(schemaExtension);

    expect(schemaDefinitionWarnings).toEqual([]);
    expect(schemaExtensionWarnings).toEqual([]);
  });

  it('warns when a schema definition / extension is provided, as well as a default root type or extension', () => {
    const serviceA = {
      typeDefs: gql`
        schema {
          query: RootQuery
        }

        type RootQuery {
          product: Product
        }

        type Product {
          sku: String
        }

        type Query {
          invalidUseOfQuery: Boolean
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateRootFieldUsed(serviceA);

    expect(warnings).toHaveLength(1);
    expect(warnings[0].extensions.code).toEqual('ROOT_QUERY_USED');
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "ROOT_QUERY_USED",
          "message": "[serviceA] Query -> Found invalid use of default root operation name \`Query\`. \`Query\` is disallowed when \`Schema.query\` is set to a type other than \`Query\`.",
        },
      ]
    `);
  });

  it('warns against using default operation type names (Query, Mutation, Subscription) when a non-default operation type name is provided in the schema definition', () => {
    const serviceA = {
      typeDefs: gql`
        schema {
          mutation: RootMutation
        }

        type RootMutation {
          updateProduct(sku: ID!): Product
        }

        type Mutation {
          invalidUseOfMutation: Boolean
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateRootFieldUsed(serviceA);

    expect(warnings).toHaveLength(1);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "ROOT_MUTATION_USED",
          "message": "[serviceA] Mutation -> Found invalid use of default root operation name \`Mutation\`. \`Mutation\` is disallowed when \`Schema.mutation\` is set to a type other than \`Mutation\`.",
        },
      ]
    `);
  });

  it("doesn't warn against using default operation type names when no schema definition is provided", () => {
    const serviceA = {
      typeDefs: gql`
        type Query {
          validUseOfQuery: Boolean
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateRootFieldUsed(serviceA);
    expect(warnings).toHaveLength(0);
  });

  it("doesn't warn against using default operation type names when a schema is defined", () => {
    const serviceA = {
      typeDefs: gql`
        schema {
          mutation: Mutation
        }

        type Query {
          validUseOfQuery: Boolean
        }

        type Mutation {
          validUseOfMutation: Product
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateRootFieldUsed(serviceA);
    expect(warnings).toHaveLength(0);
  });
});
