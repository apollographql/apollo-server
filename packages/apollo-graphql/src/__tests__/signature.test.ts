import { default as gql, disableFragmentWarnings } from 'graphql-tag';
import { defaultEngineReportingSignature } from '../signature';

// The gql duplicate fragment warning feature really is just warnings; nothing
// breaks if you turn it off in tests.
disableFragmentWarnings();

describe('defaultEngineReportingSignature', () => {
  const cases = [
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
      output: '{user{name}}',
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
      output: '{user{name}}',
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
      output: 'query OpName{user{name}}',
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
      output: 'query OpName{user{name(apple:[],bag:{},cat:ENUM_VALUE)}}',
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
      output:
        'query OpName($a:[[Boolean!]!],$b:EnumType,$c:Int!){user{name(apple:$a,bag:$b,cat:$c)}}',
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
      output: '{user{name...Bar}}fragment Bar on User{asd}',
    },
    {
      name: 'fragments out of order',
      operationName: '',
      input: gql`
        fragment Baz on User {
          jkl
        }

        {
          user {
            name
            ...Bar
            ...Baz
          }
        }

        fragment Bar on User {
          asd
        }
      `,
      output:
        '{user{name...Bar...Baz}}fragment Bar on User{asd}fragment Baz on User{jkl}',
    },
    {
      name: 'fragments in order',
      operationName: '',
      input: gql`
        {
          user {
            name
            ...Bar
            ...Baz
          }
        }

        fragment Bar on User {
          asd
        }

        fragment Baz on User {
          jkl
        }
      `,
      output:
        '{user{name...Bar...Baz}}fragment Bar on User{asd}fragment Baz on User{jkl}',
    },
    {
      name: 'fragments in order',
      operationName: '',
      input: gql`
        {
          user {
            name
            ...Bar
            ...Baz
          }
        }

        fragment Bar on User {
          asd
        }

        fragment Baz on User {
          jkl
        }
      `,
      output:
        '{user{name...Bar...Baz}}fragment Bar on User{asd}fragment Baz on User{jkl}',
    },
    {
      name: 'with a subscription',
      operationName: '',
      input: gql`
        fragment Bar on User {
          asd
        }

        fragment Baz on User {
          jkl
        }

        subscription A {
          user {
            name
            ...Bar
            ...Baz
          }
        }
      `,
      output:
        'subscription A{user{name...Bar...Baz}}' +
        'fragment Bar on User{asd}fragment Baz on User{jkl}',
    },
    {
      name: 'with a mutation',
      operationName: '',
      input: gql`
        mutation A {
          user {
            name
            ...Bar
            ...Baz
          }
        }
        fragment Baz on User {
          jkl
        }
        fragment Bar on User {
          asd
        }
      `,
      output:
        'mutation A{user{name...Bar...Baz}}' +
        'fragment Bar on User{asd}fragment Baz on User{jkl}',
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
      output:
        'query Foo($a:Boolean,$b:Int){user(age:0,name:""){name tz...Bar...on User{bee hello}}}' +
        'fragment Bar on User{age@skip(if:$a)...Nested}fragment Nested on User{blah}',
    },
  ];
  cases.forEach(({ name, operationName, input, output }) => {
    test(name, () => {
      expect(defaultEngineReportingSignature(input, operationName)).toEqual(
        output,
      );
    });
  });
});
