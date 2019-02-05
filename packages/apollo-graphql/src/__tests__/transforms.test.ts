import { default as gql, disableFragmentWarnings } from 'graphql-tag';

import { printWithReducedWhitespace, hideLiterals } from '../transforms';

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
