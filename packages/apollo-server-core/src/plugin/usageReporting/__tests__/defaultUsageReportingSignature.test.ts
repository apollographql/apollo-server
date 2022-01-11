import type { DocumentNode } from 'graphql';
import { default as gql, disableFragmentWarnings } from 'graphql-tag';
import { defaultUsageReportingSignature } from '../defaultUsageReportingSignature';

// The gql duplicate fragment warning feature really is just warnings; nothing
// breaks if you turn it off in tests.
disableFragmentWarnings();

type TestCase = { name: string; operationName: string; input: DocumentNode };

describe('defaultUsageReportingSignature', () => {
  const cases: TestCase[] = [
    // Test cases borrowed from optics-agent-js.
    {
      name: 'basic test',
      operationName: '',
      input: gql`
        {
          user {
            name
          }
        }
      `,
    },
    {
      name: 'basic test with query',
      operationName: '',
      input: gql`
        query {
          user {
            name
          }
        }
      `,
    },
    {
      name: 'basic with operation name',
      operationName: 'OpName',
      input: gql`
        query OpName {
          user {
            name
          }
        }
      `,
    },
    {
      name: 'with various inline types',
      operationName: 'OpName',
      input: gql`
        query OpName {
          user {
            name(apple: [[10]], cat: ENUM_VALUE, bag: { input: "value" })
          }
        }
      `,
    },
    {
      name: 'with various argument types',
      operationName: 'OpName',
      input: gql`
        query OpName($c: Int!, $a: [[Boolean!]!], $b: EnumType) {
          user {
            name(apple: $a, cat: $c, bag: $b)
          }
        }
      `,
    },
    {
      name: 'fragment',
      operationName: '',
      input: gql`
        {
          user {
            name
            ...Bar
          }
        }

        fragment Bar on User {
          asd
        }

        fragment Baz on User {
          jkl
        }
      `,
    },
    {
      name: 'fragments in various order',
      operationName: '',
      input: gql`
        fragment Bar on User {
          asd
        }

        {
          user {
            name
            ...Bar
          }
        }

        fragment Baz on User {
          jkl
        }
      `,
    },
    {
      name: 'full test',
      operationName: 'Foo',
      input: gql`
        query Foo($b: Int, $a: Boolean) {
          user(name: "hello", age: 5) {
            ...Bar
            ... on User {
              hello
              bee
            }
            tz
            aliased: name
          }
        }

        fragment Baz on User {
          asd
        }

        fragment Bar on User {
          age @skip(if: $a)
          ...Nested
        }

        fragment Nested on User {
          blah
        }
      `,
    },
    {
      name: 'block strings convert to normal (empty) strings',
      operationName: '',
      input: gql`
        query {
          foo(
            str: """
            hello
            world

            hooray
            """
          )
        }
      `,
    },
  ];
  cases.forEach(({ name, operationName, input }) => {
    test(name, () => {
      expect(
        defaultUsageReportingSignature(input, operationName),
      ).toMatchSnapshot();
    });
  });
});
