import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { providesNotOnEntity as validateProvidesNotOnEntity } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('providesNotOnEntity', () => {
  it('does not warn when @provides used on an entity', () => {
    const serviceA = {
      typeDefs: gql`
        type LineItem @key(fields: "sku") {
          sku: String!
          quantity: Int!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        type Product {
          lineItem: LineItem @provides(fields: "quantity")
          lineItemNonNull: LineItem! @provides(fields: "quantity")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateProvidesNotOnEntity(schema);
    expect(warnings).toMatchInlineSnapshot(`Array []`);
  });

  it('does not warn when @provides used on a list of entity', () => {
    const serviceA = {
      typeDefs: gql`
        type LineItem @key(fields: "sku") {
          sku: String!
          quantity: Int!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        type Product {
          lineItems: [LineItem] @provides(fields: "quantity")
          lineItemsNonNull: [LineItem]! @provides(fields: "quantity")
          nonNullLineItems: [LineItem!] @provides(fields: "quantity")
          nonNullLineItemsNonNull: [LineItem!]! @provides(fields: "quantity")
          deep: [[LineItem!]!]! @provides(fields: "quantity")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateProvidesNotOnEntity(schema);
    expect(warnings).toMatchInlineSnapshot(`Array []`);
  });

  it('does not warn when @provides used on an entity of a child type', () => {
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
    const warnings = validateProvidesNotOnEntity(schema);
    expect(warnings).toEqual([]);
  });

  it('warns when there is a @provides on a type that is not an entity', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          upc: String!
          id: ID!
        }

        type LineItem {
          sku: String!
          quantity: Int!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String! @external
          lineItem: LineItem @provides(fields: "quantity")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateProvidesNotOnEntity(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "PROVIDES_NOT_ON_ENTITY",
          "message": "[serviceB] Product.lineItem -> uses the @provides directive but \`Product.lineItem\` does not return a type that has a @key. Try adding a @key to the \`LineItem\` type.",
        },
      ]
    `);
  });

  it('warns when there is a @provides on a type that is not a list of entity', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          upc: String!
          id: ID!
        }

        type LineItem {
          sku: String!
          quantity: Int!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String! @external
          lineItems: [LineItem] @provides(fields: "quantity")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateProvidesNotOnEntity(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "PROVIDES_NOT_ON_ENTITY",
          "message": "[serviceB] Product.lineItems -> uses the @provides directive but \`Product.lineItems\` does not return a type that has a @key. Try adding a @key to the \`LineItem\` type.",
        },
      ]
    `);
  });

  it('warns when there is a @provides on a non-object type', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          upc: String!
          id: ID!
        }

        enum Category {
          BOOK
          MOVIE
          SONG
          ALBUM
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String! @external
          category: Category @provides(fields: "id")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateProvidesNotOnEntity(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "PROVIDES_NOT_ON_ENTITY",
          "message": "[serviceB] Product.category -> uses the @provides directive but \`Product.category\` returns \`Category\`, which is not an Object or List type. @provides can only be used on Object types with at least one @key, or Lists of such Objects.",
        },
      ]
    `);
  });

  it('warns when there is a @provides on a list of non-object type', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          upc: String!
          id: ID!
        }

        enum Category {
          BOOK
          MOVIE
          SONG
          ALBUM
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String! @external
          categories: [Category] @provides(fields: "id")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    const warnings = validateProvidesNotOnEntity(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "PROVIDES_NOT_ON_ENTITY",
          "message": "[serviceB] Product.categories -> uses the @provides directive but \`Product.categories\` returns \`[Category]\`, which is not an Object or List type. @provides can only be used on Object types with at least one @key, or Lists of such Objects.",
        },
      ]
    `);
  });
});
