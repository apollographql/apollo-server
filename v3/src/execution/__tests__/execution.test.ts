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

// An array of tuples, each tuple representing a test.
// A single tuple has the shape: [testName, { ...testParams }]
type JestInput<T> = [
  string,
  T
][];

const validQueries: JestInput<{ query: string; operationName?: string; variables?: VariableValues }> = [
  [
    "basic",
    {
      query: `
      query Basic {
        people {
          name
        }
      }
    `
    }
  ],
  [
    "with nested selection sets",
    {
      query: `
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
    "with directives",
    {
      query: `
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
    "with multiple documents",
    {
      query: `
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
    `
      query Basic {
        people {
          name
        }
    `
  ],
  [
    "empty selection set",
    `
      query Nested {
        people { }
      }
    `
  ],
  [
    "empty query",
    `
      query Empty {}
    `
  ]
];

const invalidQueries: JestInput<{ query: string; operationName?: string; }> = [
  [
    "basic",
    {
      query: `
      query Basic {
        invalidField
      }
    `
    }
  ],
  [
    "with invalid selection sets",
    {
      query: `
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
      query: `
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
      query: `
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
    query: `
      query {
        error
      }
    `
  }]
]

const schema = makeExecutableSchema({
  typeDefs: `
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

const serverTeam = [
  { id: 1, name: "James Baxley" },
  { id: 2, name: "Ashi Krishnan" },
  { id: 3, name: "Jesse Rosenberger" },
  { id: 4, name: "Trevor Scheer" }
];

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
