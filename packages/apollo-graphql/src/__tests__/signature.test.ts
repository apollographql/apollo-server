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
      output: 'fragment Bar on User{asd}{user{name...Bar}}',
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
        'fragment Bar on User{asd}fragment Baz on User{jkl}' +
        '{user{name...Bar...Baz}}',
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
        'fragment Bar on User{asd}fragment Baz on User{jkl}' +
        '{user{name...Bar...Baz}}',
    },
    {
      name: 'with multiple operations (and no operation name specified)',
      operationName: '',
      input: gql`
        fragment Bar on User {
          asd
        }

        fragment Baz on User {
          jkl
        }

        query C {
          dfg
        }

        query D {
          dfg
        }

        subscription A {
          user {
            name
            ...Bar
            ...Baz
          }
        }

        mutation B {
          abc
        }
      `,
      output:
        'fragment Bar on User{asd}fragment Baz on User{jkl}' +
        'mutation B{abc}' +
        'query C{dfg}query D{dfg}' +
        'subscription A{user{name...Bar...Baz}}',
    },
    {
      name: 'with multiple queries, and one specified',
      operationName: 'A',
      input: gql`
        {
          asd
        }

        query A {
          jkl
        }
      `,
      output: 'query A{jkl}',
    },
    {
      name: 'with a mutation',
      operationName: 'TheMutation',
      input: gql`
        mutation TheMutation {
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
        'fragment Bar on User{asd}fragment Baz on User{jkl}' +
        'mutation TheMutation{user{name...Bar...Baz}}',
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
        'fragment Bar on User{age@skip(if:$a)...Nested}fragment Nested on User{blah}' +
        'query Foo($a:Boolean,$b:Int){user(age:0,name:""){name tz...Bar...on User{bee hello}}}',
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
