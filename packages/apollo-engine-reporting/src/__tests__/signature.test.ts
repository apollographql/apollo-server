import { DocumentNode } from 'graphql';
import { default as gql, disableFragmentWarnings } from 'graphql-tag';

import {
  printWithReducedWhitespace,
  hideLiterals,
  dropUnusedDefinitions,
  sortAST,
  removeAliases,
} from '../signature';

// The gql duplicate fragment warning feature really is just warnings; nothing
// breaks if you turn it off in tests.
disableFragmentWarnings();

describe('printWithReducedWhitespace', () => {
  const cases = [
    {
      name: 'lots of whitespace',
      // Note: there's a tab after "tab->", which prettier wants to keep as a
      // literal tab rather than \t.  In the output, there should be a literal
      // backslash-t.
      input: gql`
        query Foo($a: Int) {
          user(
            name: "   tab->	yay"
            other: """
            apple
               bag
            cat
            """
          ) {
            name
          }
        }
      `,
      output:
        'query Foo($a:Int){user(name:"   tab->\\tyay",other:"apple\\n   bag\\ncat"){name}}',
    },
  ];
  cases.forEach(({ name, input, output }) => {
    test(name, () => {
      expect(printWithReducedWhitespace(input)).toEqual(output);
    });
  });
});

describe('hideLiterals', () => {
  const cases = [
    {
      name: 'full test',
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

        fragment Bar on User {
          age @skip(if: $a)
          ...Nested
        }

        fragment Nested on User {
          blah
        }
      `,
      output:
        'query Foo($b:Int,$a:Boolean){user(name:"",age:0){...Bar...on User{hello bee}tz aliased:name}}' +
        'fragment Bar on User{age@skip(if:$a)...Nested}fragment Nested on User{blah}',
    },
  ];
  cases.forEach(({ name, input, output }) => {
    test(name, () => {
      expect(printWithReducedWhitespace(hideLiterals(input))).toEqual(output);
    });
  });
});

describe('aggressive signature', () => {
  function aggressive(ast: DocumentNode, operationName: string): string {
    return printWithReducedWhitespace(
      removeAliases(
        hideLiterals(sortAST(dropUnusedDefinitions(ast, operationName))),
      ),
    );
  }

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
      expect(aggressive(input, operationName)).toEqual(output);
    });
  });
});
