import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { keysMatchBaseService as validateKeysMatchBaseService } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('keysMatchBaseService', () => {
  it('returns no errors with proper @key usage', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          upc: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String! @external
          price: Int!
        }
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema, errors } = composeServices(serviceList);
    expect(errors).toHaveLength(0);

    const validationErrors = validateKeysMatchBaseService({
      schema,
      serviceList,
    });
    expect(validationErrors).toHaveLength(0);
  });

  it('requires a @key to be specified on the originating type', () => {
    const serviceA = {
      typeDefs: gql`
        type Product {
          sku: String!
          upc: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String! @external
          price: Int!
        }
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema, errors } = composeServices(serviceList);
    expect(errors).toHaveLength(0);

    const validationErrors = validateKeysMatchBaseService({
      schema,
      serviceList,
    });
    expect(validationErrors).toHaveLength(1);
    expect(validationErrors[0]).toMatchInlineSnapshot(`
      Object {
        "code": "KEY_MISSING_ON_BASE",
        "message": "[serviceA] Product -> appears to be an entity but no @key directives are specified on the originating type.",
      }
    `);
  });

  it('requires extending services to use a @key specified by the originating type', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku upc") {
          sku: String!
          upc: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String! @external
          price: Int!
        }
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema, errors } = composeServices(serviceList);
    expect(errors).toHaveLength(0);

    const validationErrors = validateKeysMatchBaseService({
      schema,
      serviceList,
    });
    expect(validationErrors).toHaveLength(1);
    expect(validationErrors[0]).toMatchInlineSnapshot(`
      Object {
        "code": "KEY_NOT_SPECIFIED",
        "message": "[serviceB] Product -> extends from serviceA but specifies an invalid @key directive. Valid @key directives are specified by the originating type. Available @key directives for this type are:
      	@key(fields: \\"sku upc\\")",
      }
    `);
  });
});
