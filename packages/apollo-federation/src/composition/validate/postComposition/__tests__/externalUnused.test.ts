import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { externalUnused as validateExternalUnused } from '../';

describe('externalUnused', () => {
  it('warns when there is an unused @external field', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "id") {
          sku: String!
          upc: String!
          id: ID!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product {
          sku: String! @external
          id: ID! @external
          price: Int! @requires(fields: "id")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        [GraphQLError: [serviceB] Product.sku -> is marked as @external but is not used by a @requires, @key, or @provides directive.],
      ]
    `);
  });

  it('does not warn when @external is selected by a @key', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String! @external
          price: Float!
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toEqual([]);
  });

  it('does not warn when @external is selected by a @requires', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product {
          sku: String! @external
          price: Int! @requires(fields: "sku")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toEqual([]);
  });

  it('does not warn when @external is selected by a @provides', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          id: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String! @external
          price: Int! @provides(fields: "id")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toEqual([]);
  });

  it('does not warn when @external is selected by a @provides used from a child type', () => {
    const serviceA = {
      typeDefs: gql`
        type User @key(fields: "id") {
          id: ID!
          username: String
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        type Review {
          author: User @provides(fields: "username")
        }

        type User {
          username: String @external
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toEqual([]);
  });

  it('does not warn when @external is used on type with multiple @key directives', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "upc") @key(fields: "sku") {
          upc: String
          sku: String
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "upc") {
          upc: String @external
        }
      `,
      name: 'serviceB',
    };

    const serviceC = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String @external
        }
      `,
      name: 'serviceC',
    };

    const { schema, errors } = composeServices([serviceA, serviceB, serviceC]);
    const warnings = validateExternalUnused(schema);
    expect(warnings).toEqual([]);
  });
});
