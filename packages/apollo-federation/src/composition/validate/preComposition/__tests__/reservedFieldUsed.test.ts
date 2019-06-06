import gql from 'graphql-tag';
import { reservedFieldUsed as validateReservedFieldUsed } from '..';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('reservedFieldUsed', () => {
  it('has no warnings when _service and _entities arent used', () => {
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

    const warnings = validateReservedFieldUsed(serviceA);
    expect(warnings).toEqual([]);
  });

  it('warns when _service or _entities is used at the query root', () => {
    const serviceA = {
      typeDefs: gql`
        type Query {
          product: Product
          _service: String!
          _entities: String!
        }

        type Product {
          sku: String
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateReservedFieldUsed(serviceA);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "RESERVED_FIELD_USED",
          "message": "[serviceA] Query._service -> _service is a field reserved for federation and can't be used at the Query root.",
        },
        Object {
          "code": "RESERVED_FIELD_USED",
          "message": "[serviceA] Query._entities -> _entities is a field reserved for federation and can't be used at the Query root.",
        },
      ]
    `);
  });

  it('warns when _service or _entities is used in a schema extension', () => {
    const schemaDefinition = {
      typeDefs: gql`
        schema {
          query: RootQuery
        }

        type RootQuery {
          product: Product
          _entities: String!
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
          _service: String
          product: Product
        }

        type Product {
          sku: String
        }
      `,
      name: 'schemaExtension',
    };

    const schemaDefinitionWarnings = validateReservedFieldUsed(
      schemaDefinition,
    );
    const schemaExtensionWarnings = validateReservedFieldUsed(schemaExtension);

    expect(schemaDefinitionWarnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "RESERVED_FIELD_USED",
          "message": "[schemaDefinition] RootQuery._entities -> _entities is a field reserved for federation and can't be used at the Query root.",
        },
      ]
    `);
    expect(schemaExtensionWarnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "RESERVED_FIELD_USED",
          "message": "[schemaExtension] RootQuery._service -> _service is a field reserved for federation and can't be used at the Query root.",
        },
      ]
    `);
  });

  it('warns when reserved fields are used on custom Query types', () => {
    const serviceA = {
      typeDefs: gql`
        schema {
          query: RootQuery
        }

        type RootQuery {
          product: Product
          _service: String
          _entities: String
        }

        type Product {
          sku: String
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateReservedFieldUsed(serviceA);

    expect(warnings).toHaveLength(2);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "RESERVED_FIELD_USED",
          "message": "[serviceA] RootQuery._service -> _service is a field reserved for federation and can't be used at the Query root.",
        },
        Object {
          "code": "RESERVED_FIELD_USED",
          "message": "[serviceA] RootQuery._entities -> _entities is a field reserved for federation and can't be used at the Query root.",
        },
      ]
    `);
  });
});
