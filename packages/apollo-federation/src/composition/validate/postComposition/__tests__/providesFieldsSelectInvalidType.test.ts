import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { providesFieldsSelectInvalidType as validateprovidesFieldsSelectInvalidType } from '../';

describe('providesFieldsSelectInvalidType', () => {
  it('returns no warnings with proper @provides usage', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          upc: String!
          color: Color!
        }

        type Color {
          id: ID!
          value: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product {
          upc: String! @external
          price: Int! @provides(fields: "upc")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);

    const warnings = validateprovidesFieldsSelectInvalidType(schema);
    expect(warnings).toHaveLength(0);
  });

  it('warns if @provides references fields of a list type', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          upc: String!
          color: Color!
          ids: [ID]!
        }

        type Color {
          id: ID!
          value: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product {
          ids: [ID]! @external
          price: Int! @provides(fields: "ids")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);

    const warnings = validateprovidesFieldsSelectInvalidType(schema);
    expect(warnings).toMatchInlineSnapshot(`
                  Array [
                    [GraphQLError: [serviceB] Product.price -> A @provides selects Product.ids, which is a list type. A field cannot @provide lists.],
                  ]
            `);
  });

  it('warns if @provides references fields of an interface type', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "sku") {
          sku: String!
          upc: String!
          related: Node!
        }

        interface Node {
          id: ID!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product {
          related: Node! @external
          price: Int! @provides(fields: "related")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);

    const warnings = validateprovidesFieldsSelectInvalidType(schema);
    expect(warnings).toMatchInlineSnapshot(`
            Array [
              [GraphQLError: [serviceB] Product.price -> A @provides selects Product.related, which is an interface type. A field cannot @provide interfaces.],
            ]
        `);
  });

  it('warns if @provides references fields of a union type', () => {
    const serviceA = {
      typeDefs: gql`
        type Product @key(fields: "price") {
          sku: String!
          price: Numeric!
        }

        union Numeric = Float | Int
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        extend type Product {
          price: Numeric! @external
          weight: Int! @provides(fields: "price")
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);

    const warnings = validateprovidesFieldsSelectInvalidType(schema);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        [GraphQLError: [serviceB] Product.weight -> A @provides selects Product.price, which is a union type. A field cannot @provide union types.],
      ]
    `);
  });
});
