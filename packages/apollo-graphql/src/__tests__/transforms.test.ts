import { default as gql, disableFragmentWarnings } from 'graphql-tag';

import {
  printWithReducedWhitespace,
  hideLiterals,
  lexicographicSortOperations,
  dropUnusedDefinitions,
} from '../transforms';

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

describe('dropUnusedDefinitions', () => {
  const cases = [
    {
      name:
        'demonstrates that separateOperations can only accommodate one anonymous operation',
      operationName: '',
      input: gql`
        {
          abc
        }
        {
          def
        }
      `,
      output: '{def}',
    },
    {
      name:
        'gets a document with a single, specified operation and only the fragments it needs',
      operationName: 'TheMutation',
      input: gql`
        query IgnoreMe {
          abc
          ...DropThisFragment
        }

        fragment DropThisFragment on SomeType {
          def
        }

        mutation TheMutation {
          ...KeepThisFragment
        }

        fragment KeepThisFragment on AnotherType {
          abc
          ...KeepThisNestedFragment
        }

        fragment KeepThisNestedFragment on AnotherType {
          ghi
        }
      `,
      output:
        'mutation TheMutation{...KeepThisFragment}' +
        'fragment KeepThisFragment on AnotherType{abc...KeepThisNestedFragment}' +
        'fragment KeepThisNestedFragment on AnotherType{ghi}',
    },
  ];

  cases.forEach(({ name, operationName, input, output }) => {
    test(name, () => {
      expect(
        printWithReducedWhitespace(dropUnusedDefinitions(input, operationName)),
      ).toEqual(output);
    });
  });
});

describe('lexicographicSortOperations', () => {
  const cases = [
    {
      name: 'sorts fields with respect to each other',
      input: gql`
        {
          def
          abc {
            z
            a
          }
        }
      `,
      output: '{abc{a z}def}',
    },
    {
      name:
        'sorts nameless operations deterministically, relative to each other (pt. 1)',
      input: gql`
        {
          abc
          def
          ghi
        }
        {
          abc
        }

        {
          def
        }
      `,
      output: '{abc def ghi}{abc}{def}',
    },
    {
      name:
        'sorts nameless operations deterministically, relative to each other (pt. 2)',
      input: gql`
        {
          def
        }
        {
          abc
          def
          ghi
        }
        {
          abc
        }
      `,
      output: '{abc def ghi}{abc}{def}',
    },
    {
      name:
        'sorts various (named / unnamed) operations and fragments, relative to each other (pt. 1)',
      input: gql`
        query Thing1 {
          asdf
        }
        subscription Thing2 {
          lkjkl
          ...A
        }
        query {
          fhg
          ...A
        }
        fragment A on B {
          abc
          def
        }
        mutation {
          abc
          def
        }
      `,
      output:
        'fragment A on B{abc def}' +
        'mutation{abc def}' +
        'query Thing1{asdf}{fhg...A}' +
        'subscription Thing2{lkjkl...A}',
    },
    {
      name:
        'sorts various (named / unnamed) operations and fragments, relative to each other (pt. 2)',
      input: gql`
        fragment A on B {
          abc
          def
        }
        query Thing1 {
          asdf
        }
        mutation {
          abc
          def
        }
        subscription Thing2 {
          lkjkl
          ...A
        }
        query {
          fhg
          ...A
        }
      `,
      output:
        'fragment A on B{abc def}' +
        'mutation{abc def}' +
        'query Thing1{asdf}{fhg...A}' +
        'subscription Thing2{lkjkl...A}',
    },
  ];
  cases.forEach(({ name, input, output }) => {
    test(name, () => {
      expect(
        printWithReducedWhitespace(lexicographicSortOperations(input)),
      ).toEqual(output);
    });
  });
});
