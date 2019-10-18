import {
  parseGraphqlRequest,
  validateGraphqlRequest,
  executeGraphqlRequest
  // processGraphQLRequest
} from "..";
import { astSerializer } from "../../snapshotSerializers";
import { VariableValues } from "apollo-server-core";
import { makeExecutableSchema } from "graphql-tools";
import { GraphQLError } from "graphql";

expect.addSnapshotSerializer(astSerializer);

// This is a handy trick for syntax highlighting GraphQL query strings in editors
// like VS Code that depend on the gql`` tagged template literal.
const gql = String.raw;

// An array of tuples, each tuple representing a test.
// A single tuple has the shape: [testName, { ...testParams }]
type JestInput<T> = [
  string,
  T
][];

const validQueries: JestInput<{ query: string; operationName?: string; variables?: VariableValues }> = [
  [
    "basic - { people { name } }",
    {
      query: gql`
      query Basic {
        people {
          name
        }
      }
    `
    }
  ],
  [
    "with nested selection sets - { people { name friends { name friends { name } } } }",
    {
      query: gql`
      query Nested {
        people {
          name
          friends {
            name
            friends {
              name
            }
          }
        }
      }
    `
    }
  ],
  [
    "with directives - { people { name { friends { name } } }",
    {
      query: gql`
      query Directives($includeFriends: Boolean!) {
        people {
          name
          friends @include(if: $includeFriends) {
            name
          }
        }
      }
      `,
      variables: { includeFriends: true }
    }
  ],
  [
    "with multiple documents - { people { name } }",
    {
      query: gql`
      query FirstDocument {
        people {
          name
        }
      }

      query SecondDocument {
        people {
          id
        }
      }
    `,
      operationName: "FirstDocument"
    }
  ]
];

const unparseableQueries: JestInput<string>= [
  [
    "missing closing }",
    // Using gql on this unparseable document breaks code highlighting everywhere
    `
      query Basic {
        people {
          name
        }
    `
  ],
  [
    "empty selection set",
    gql`
      query Nested {
        people { }
      }
    `
  ],
  [
    "empty query",
    gql`
      query Empty {}
    `
  ]
];

const invalidQueries: JestInput<{ query: string; operationName?: string; }> = [
  [
    "basic",
    {
      query: gql`
      query Basic {
        invalidField
      }
    `
    }
  ],
  [
    "with invalid selection sets",
    {
      query: gql`
      query Nested {
        people {
          name
          invalidField
        }
      }
    `
    }
  ],
  [
    "missing directive",
    {
      query: gql`
      query MissingDirective {
        people @invalid {
          name
        }
      }
      `
    }
  ],
  [
    "with multiple errors",
    {
      query: gql`
      query FirstDocument {
        people {
          invalidOne
        }
        invalidTwo
      }
    `
    }
  ]
];

const nonExecutableQueries: JestInput<{ query: string }> = [
  ['error field throws', {
    query: gql`
      query {
        error
      }
    `
  }]
]

const serverTeam = [
  { id: 1, name: "James Baxley" },
  { id: 2, name: "Ashi Krishnan" },
  { id: 3, name: "Jesse Rosenberger" },
  { id: 4, name: "Trevor Scheer" }
];

const schema = makeExecutableSchema({
  typeDefs: gql`
    type Query {
      people: [Person]
      error: String
    }

    type Person {
      id: ID
      name: String
      friends: [Person]
    }
  `,
  resolvers: {
    Query: {
      people() {
        return serverTeam;
      },
      error() {
        throw new GraphQLError("Error while resolving `error` field");
      }
    },
    Person: {
      async friends(parentValue) {
        return serverTeam.filter(({ id }) => id !== parentValue.id);
      }
    }
  }
});

describe("parseGraphqlRequest", () => {
  it.each(validQueries)("Parses valid queries - %s", (_, { query }) => {
    const parsed = parseGraphqlRequest({ query });
    expect(parsed).toMatchSnapshot();
  });

  it.each(unparseableQueries)("Throws for invalid queries - %s", (_, query) => {
    expect(() => parseGraphqlRequest({ query })).toThrowErrorMatchingSnapshot();
  });
});

describe("validateGraphqlRequest", () => {
  it.each(validQueries)(
    "valid queries against schema: %s",
    (_, { query, operationName }) => {
      const document = parseGraphqlRequest({ query });
      expect(() => validateGraphqlRequest({
        schema,
        document,
        operationName
      })).not.toThrow();
    }
  );

  it.each(invalidQueries)(
    "invalid queries against schema: %s",
    (_, { query, operationName }) => {
      const document = parseGraphqlRequest({ query });

      try {
        validateGraphqlRequest({
          schema,
          document,
          operationName
        });
      } catch (e) {
        // Jest's `expect().toThrowErrorMatchingSnapshot()` doesn't work for throwing an array of errors
        expect(e).toMatchSnapshot();
      }
    }
  );
});

describe("executeGraphqlRequest", () => {
  it.each(validQueries)(
    "Executable queries - %s",
    async (_, { query, operationName, variables }) => {
      const document = parseGraphqlRequest({ query });
      const result = await executeGraphqlRequest({
        schema,
        document,
        operationName,
        variables
      });
      expect(result).toMatchSnapshot();
    }
  );

  it.each(nonExecutableQueries)(
    'Errors during execution - %s',
    async (_, { query }) => {
      const document = parseGraphqlRequest({ query });
      const result = await executeGraphqlRequest({
        schema,
        document
      });

      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result).toMatchSnapshot();
    })
});
