import gql from 'graphql-tag';
import { keyFieldsMissingExternal as validateKeyFieldsMissingExternal } from '../';
import { graphqlErrorSerializer } from '../../../../snapshotSerializers';

expect.addSnapshotSerializer(graphqlErrorSerializer);

describe('keyFieldsMissingExternal', () => {
  it('has no warnings when @key fields reference an @external field', () => {
    const serviceA = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          sku: String! @external
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

    const warnings = validateKeyFieldsMissingExternal(serviceA);
    expect(warnings).toHaveLength(0);
  });

  it('has no warnings with correct selection set / nested @external usage', () => {
    const serviceA = {
      typeDefs: gql`
        extend type Car @key(fields: "model { name kit { upc } } year") {
          model: Model! @external
          year: String! @external
          color: String!
        }

        extend type Model {
          name: String! @external
          kit: Kit @external
        }

        extend type Kit {
          upc: String! @external
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateKeyFieldsMissingExternal(serviceA);
    expect(warnings).toHaveLength(0);
  });

  it('has no warnings with @deprecated directive usage', () => {
    const serviceA = {
      typeDefs: gql`
        extend type Car @key(fields: "model { name kit { upc } } year") {
          model: Model! @external
          year: String! @external
          color: String! @deprecated(reason: "Use colors instead")
          colors: Color!
        }

        extend type Model {
          name: String! @external
          kit: Kit @external
        }

        extend type Kit {
          upc: String! @external
        }

        enum Color {
          Red
          Blue
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateKeyFieldsMissingExternal(serviceA);
    expect(warnings).toHaveLength(0);
  });

  it("warns when a @key argument doesn't reference an @external field", () => {
    const serviceA = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
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

    const warnings = validateKeyFieldsMissingExternal(serviceA);
    expect(warnings).toHaveLength(1);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "KEY_FIELDS_MISSING_EXTERNAL",
          "message": "[serviceA] Product -> A @key directive specifies the \`sku\` field which has no matching @external field.",
        },
      ]
    `);
  });

  it("warns when a @key argument references a field that isn't known", () => {
    const serviceA = {
      typeDefs: gql`
        extend type Product @key(fields: "sku") {
          upc: String! @external
          color: Color!
        }

        type Color {
          id: ID!
          value: String!
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateKeyFieldsMissingExternal(serviceA);
    expect(warnings).toHaveLength(1);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "KEY_FIELDS_MISSING_EXTERNAL",
          "message": "[serviceA] Product -> A @key directive specifies a field which is not found in this service. Add a field to this type with @external.",
        },
      ]
    `);
  });

  it("warns when a @key argument doesn't reference an @external field", () => {
    const serviceA = {
      typeDefs: gql`
        extend type Car @key(fields: "model { name kit { upc } } year") {
          model: Model! @external
          year: String! @external
        }

        extend type Model {
          name: String!
          kit: Kit
        }

        type Kit {
          upc: String!
        }
      `,
      name: 'serviceA',
    };

    const warnings = validateKeyFieldsMissingExternal(serviceA);
    expect(warnings).toHaveLength(3);
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "KEY_FIELDS_MISSING_EXTERNAL",
          "message": "[serviceA] Model -> A @key directive specifies the \`name\` field which has no matching @external field.",
        },
        Object {
          "code": "KEY_FIELDS_MISSING_EXTERNAL",
          "message": "[serviceA] Model -> A @key directive specifies the \`kit\` field which has no matching @external field.",
        },
        Object {
          "code": "KEY_FIELDS_MISSING_EXTERNAL",
          "message": "[serviceA] Kit -> A @key directive specifies the \`upc\` field which has no matching @external field.",
        },
      ]
    `);
  });
});
