import gql from 'graphql-tag';
import { composeServices } from '../../../compose';
import { providesFieldsSelectInvalidType as validateprovidesFieldsSelectInvalidType } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

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

    const serviceList = [serviceA, serviceB];
    const { schema, errors } = composeServices(serviceList);
    expect(errors).toHaveLength(0);

    const warnings = validateprovidesFieldsSelectInvalidType({
      schema,
      serviceList,
    });
    expect(warnings).toHaveLength(0);
  });

  it('warns if @provides references fields of a list type', () => {
    const serviceA = {
      typeDefs: gql`
        type Review @key(fields: "id") {
          id: ID!
          author: User @provides(fields: "wishLists")
        }

        extend type User @key(fields: "id") {
          id: ID! @external
          wishLists: [WishList] @external
        }

        extend type WishList @key(fields: "id") {
          id: ID! @external
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        type User @key(fields: "id") {
          id: ID!
          wishLists: [WishList]
        }

        type WishList @key(fields: "id") {
          id: ID!
        }
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema, errors } = composeServices(serviceList);
    expect(errors).toHaveLength(0);

    const warnings = validateprovidesFieldsSelectInvalidType({
      schema,
      serviceList,
    });
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "PROVIDES_FIELDS_SELECT_INVALID_TYPE",
          "message": "[serviceA] Review.author -> A @provides selects User.wishLists, which is a list type. A field cannot @provide lists.",
        },
      ]
    `);
  });

  it('warns if @provides references fields of an interface type', () => {
    const serviceA = {
      typeDefs: gql`
        type Review @key(fields: "id") {
          id: ID!
          author: User @provides(fields: "account")
        }

        extend type User @key(fields: "id") {
          id: ID! @external
          account: Account @external
        }

        extend interface Account {
          username: String @external
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        type User @key(fields: "id") {
          id: ID!
          account: Account
        }

        interface Account {
          username: String
        }
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema, errors } = composeServices(serviceList);
    expect(errors).toHaveLength(0);

    const warnings = validateprovidesFieldsSelectInvalidType({
      schema,
      serviceList,
    });
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "PROVIDES_FIELDS_SELECT_INVALID_TYPE",
          "message": "[serviceA] Review.author -> A @provides selects User.account, which is an interface type. A field cannot @provide interfaces.",
        },
      ]
    `);
  });

  it('warns if @provides references fields of a union type', () => {
    const serviceA = {
      typeDefs: gql`
        type Review @key(fields: "id") {
          id: ID!
          author: User @provides(fields: "account")
        }

        extend type User @key(fields: "id") {
          id: ID! @external
          account: Account @external
        }

        extend union Account = PasswordAccount | SMSAccount

        extend type PasswordAccount @key(fields: "email") {
          email: String! @external
        }

        extend type SMSAccount @key(fields: "phone") {
          phone: String! @external
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        type User @key(fields: "id") {
          id: ID!
          account: Account
        }

        union Account = PasswordAccount | SMSAccount

        type PasswordAccount @key(fields: "email") {
          email: String!
        }

        type SMSAccount @key(fields: "phone") {
          phone: String!
        }
      `,
      name: 'serviceB',
    };

    const serviceList = [serviceA, serviceB];
    const { schema, errors } = composeServices(serviceList);
    expect(errors).toHaveLength(0);

    const warnings = validateprovidesFieldsSelectInvalidType({
      schema,
      serviceList,
    });
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "PROVIDES_FIELDS_SELECT_INVALID_TYPE",
          "message": "[serviceA] Review.author -> A @provides selects User.account, which is a union type. A field cannot @provide union types.",
        },
      ]
    `);
  });
});
