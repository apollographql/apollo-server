import { buildASTSchema } from 'graphql';
import gql from 'graphql-tag';
import { calculateReferencedFieldsByType } from '../referencedFields';

const schema = buildASTSchema(gql`
  type Query {
    f1: Int
    f2: Int
    a: A
    aa: A
    myInterface: MyInterface
  }

  type A implements MyInterface {
    x: ID
    y: String!
  }

  interface MyInterface {
    x: ID
  }
`);

describe('calculateReferencedFieldsByType', () => {
  it('basic', () => {
    expect(
      calculateReferencedFieldsByType({
        document: gql`
          {
            f1
          }
        `,
        schema,
        resolvedOperationName: null,
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "Query": Object {
          "fieldNames": Array [
            "f1",
          ],
          "isInterface": false,
        },
      }
    `);
  });

  it('multiple operations and fragments', () => {
    expect(
      calculateReferencedFieldsByType({
        document: gql`
          query Q1 {
            f1
            a {
              ...AStuff
            }
          }
          query Q2 {
            f2
            aa {
              ...OtherAStuff
            }
          }
          fragment AStuff on A {
            x
          }
          fragment OtherAStuff on A {
            y
          }
        `,
        schema,
        resolvedOperationName: 'Q1',
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "A": Object {
          "fieldNames": Array [
            "x",
          ],
          "isInterface": false,
        },
        "Query": Object {
          "fieldNames": Array [
            "f1",
            "a",
          ],
          "isInterface": false,
        },
      }
    `);
  });

  it('interfaces', () => {
    expect(
      calculateReferencedFieldsByType({
        document: gql`
          query {
            myInterface {
              x
            }
          }
        `,
        schema,
        resolvedOperationName: null,
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "MyInterface": Object {
          "fieldNames": Array [
            "x",
          ],
          "isInterface": true,
        },
        "Query": Object {
          "fieldNames": Array [
            "myInterface",
          ],
          "isInterface": false,
        },
      }
    `);
  });

  it('interface with fragment', () => {
    expect(
      calculateReferencedFieldsByType({
        document: gql`
          query {
            myInterface {
              x
              ... on A {
                y
              }
            }
          }
        `,
        schema,
        resolvedOperationName: null,
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "A": Object {
          "fieldNames": Array [
            "y",
          ],
          "isInterface": false,
        },
        "MyInterface": Object {
          "fieldNames": Array [
            "x",
          ],
          "isInterface": true,
        },
        "Query": Object {
          "fieldNames": Array [
            "myInterface",
          ],
          "isInterface": false,
        },
      }
    `);
  });
});

it('interface with fragment that uses interface field', () => {
  expect(
    calculateReferencedFieldsByType({
      document: gql`
        query {
          myInterface {
            ... on A {
              # Even though x exists on the interface, we only want this to
              # count towards A.x below, because this operation would work just
              # as well if x were removed from the interface as long as it was
              # left on A.
              x
            }
          }
        }
      `,
      schema,
      resolvedOperationName: null,
    }),
  ).toMatchInlineSnapshot(`
    Object {
      "A": Object {
        "fieldNames": Array [
          "x",
        ],
        "isInterface": false,
      },
      "Query": Object {
        "fieldNames": Array [
          "myInterface",
        ],
        "isInterface": false,
      },
    }
  `);
});
