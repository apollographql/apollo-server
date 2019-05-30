import gql from 'graphql-tag';
import { rootFieldUsed as validateRootFieldUsed } from '../';

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
    expect(warnings).toEqual([]);
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
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        [GraphQLError: [serviceA] Query -> Found invalid use of default root operation type \`Query\`. Default root operation type names (Query, Mutation, Subscription) are disallowed when a schema is defined or extended within a service.],
      ]
    `);
  });
});
