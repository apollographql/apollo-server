import {
  parseGraphqlRequest,
  validateGraphqlRequest,
  executeGraphqlRequest,
  processGraphqlRequest,
} from '..';
import { astSerializer } from '../../snapshotSerializers';
import { VariableValues } from 'apollo-server-core';
import { makeExecutableSchema } from 'graphql-tools';
import { GraphQLError } from 'graphql';

expect.addSnapshotSerializer(astSerializer);

// This is a handy trick for syntax highlighting GraphQL query strings in editors
// like VS Code that depend on the gql`` tagged template literal.
const gql = String.raw;

// An array of tuples, each tuple representing a test.
// A single tuple has the shape: [testName, { ...testParams }]
type JestInput<T> = [string, T][];

const validQueries: JestInput<{
  query: string;
  operationName?: string;
  variables?: VariableValues;
}> = [
  [
    'basic - { people { name } }',
    {
      query: gql`
        query Basic {
          people {
            name
          }
        }
      `,
    },
  ],
  [
    'with nested selection sets - { people { name friends { name friends { name } } } }',
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
      `,
    },
  ],
  [
    'with directives - { people { name { friends { name } } }',
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
      variables: { includeFriends: true },
    },
  ],
  [
    'with multiple documents - { people { name } }',
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
      operationName: 'FirstDocument',
    },
  ]
];

// Using gql on these unparseable document breaks code highlighting and other
// tooling dependent on graphql's parser.
const unparseableQueries: JestInput<string> = [
  [
    'missing closing }',
    `
      query Basic {
        people {
          name
        }
    `,
  ],
  [
    'empty selection set',
    `
      query Nested {
        people { }
      }
    `,
  ],
  [
    'empty query',
    `
      query Empty {}
    `,
  ],
];

const invalidQueries: JestInput<{ query: string; operationName?: string }> = [
  [
    'basic',
    {
      query: gql`
        query Basic {
          invalidField
        }
      `,
    },
  ],
  [
    'with invalid selection sets',
    {
      query: gql`
        query Nested {
          people {
            name
            invalidField
          }
        }
      `,
    },
  ],
  [
    'missing directive',
    {
      query: gql`
        query MissingDirective {
          people @invalid {
            name
          }
        }
      `,
    },
  ],
  [
    'with multiple errors',
    {
      query: gql`
        query FirstDocument {
          people {
            invalidOne
          }
          invalidTwo
        }
      `,
    },
  ],
];

const nonExecutableQueries: JestInput<{ query: string }> = [
  [
    'error field throws',
    {
      query: gql`
        query {
          error
        }
      `,
    },
  ],
  [
    'throws multiple errors',
    {
      query: gql`
        query {
          error
          people {
            nestedError
          }
        }
      `,
    },
  ],
];

const serverTeam = [
  { id: 1, name: 'James Baxley' },
  { id: 2, name: 'Ashi Krishnan' },
  { id: 3, name: 'Jesse Rosenberger' },
  { id: 4, name: 'Trevor Scheer' },
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
      nestedError: String
    }
  `,
  resolvers: {
    Query: {
      people() {
        return serverTeam;
      },
      error() {
        throw new GraphQLError('Error while resolving `error` field');
      },
    },
    Person: {
      async friends(parentValue) {
        return serverTeam.filter(({ id }) => id !== parentValue.id);
      },
      nestedError() {
        throw new GraphQLError('Error while resolving `nestedError` field');
      },
    },
  },
});

describe('parseGraphqlRequest', () => {
  it.each(validQueries)('Parses valid queries - %s', (_, { query }) => {
    const parseResult = parseGraphqlRequest({ query });
    if ('document' in parseResult) {
      expect(parseResult.document).toMatchSnapshot();
    }
  });

  it.each(unparseableQueries)('Returns an error for invalid queries - %s', (_, query) => {
    const parseResult = parseGraphqlRequest({query});
    if ('error' in parseResult) {
      expect(parseResult.error).toMatchSnapshot();
    }
  });
});

describe('validateGraphqlRequest', () => {
  it.each(validQueries)(
    'valid queries against schema: %s',
    (_, { query, operationName }) => {

      const parseResult = parseGraphqlRequest({ query });
      if ('error' in parseResult) {
        throw new Error('Unexpected parse failure in parseable query. Are you sure you added a valid query to the validQueries test cases?');
      }

      const validationErrors =
        validateGraphqlRequest({
          schema,
          document: parseResult.document,
          operationName,
        });

      expect(validationErrors).toHaveLength(0);
    }
  );

  it.each(invalidQueries)(
    'invalid queries against schema: %s',
    (_, { query, operationName }) => {
      const parseResult = parseGraphqlRequest({ query });
      if ('error' in parseResult) {
        throw new Error('Unexpected parse failure in parseable query. Are you sure you added a parseable query to the invalidQueries test cases?');
      }

      const validationErrors =
        validateGraphqlRequest({
          schema,
          document: parseResult.document,
          operationName,
        });

      expect(validationErrors).toMatchSnapshot();
    }
  );
});

describe('executeGraphqlRequest', () => {
  it.each(validQueries)(
    'Executable queries - %s',
    async (_, { query, operationName, variables }) => {
      const parseResult = parseGraphqlRequest({ query });
      if ('error' in parseResult) {
        throw new Error('Unexpected parse failure in parseable query. Are you sure you added a parseable query to the validQueries test cases?');
      }

      const result = await executeGraphqlRequest({
        schema,
        document: parseResult.document,
        operationName,
        variables,
      });
      expect(result).toMatchSnapshot();
    }
  );

  it.each(nonExecutableQueries)(
    'Errors during execution - %s',
    async (_, { query }) => {
      const parseResult = parseGraphqlRequest({ query });
      if ('error' in parseResult) {
        throw new Error('Unexpected parse failure in parseable query. Are you sure you added a parseable query to the nonExecutableQueries test cases?');
      }

      const { errors } = await executeGraphqlRequest({
        schema,
        document: parseResult.document,
      });

      expect(errors!.length).toBeGreaterThan(0);
      expect(errors).toMatchSnapshot();
    }
  );
});

describe('processGraphqlRequest', () => {
  it.each(validQueries)(
    'Executable queries - %s',
    async (_, { query, operationName, variables }) => {
      const { data, errors } = await processGraphqlRequest({
        schema,
        request: {
          query,
          operationName,
          variables,
        },
      });

      expect(errors).toBeUndefined();
      expect(data).toMatchSnapshot();
    }
  );

  it.each(unparseableQueries)('Unparseable queries - %s', async (_, query) => {
    const { errors } = await processGraphqlRequest({
      schema,
      request: {
        query,
      },
    });

    expect(errors).toMatchSnapshot();
  });

  it.each(invalidQueries)(
    'Invalid queries - %s',
    async (_, { query, operationName }) => {
      const { errors } = await processGraphqlRequest({
        schema,
        request: {
          query,
          operationName,
        },
      });

      expect(errors).toMatchSnapshot();
    }
  );

  it.each(nonExecutableQueries)(
    'Non-executable queries - %s',
    async (_, { query }) => {
      const { errors } = await processGraphqlRequest({
        schema,
        request: {
          query,
        },
      });

      expect(errors!.length).toBeGreaterThan(0);
      expect(errors).toMatchSnapshot();
    }
  );
});
