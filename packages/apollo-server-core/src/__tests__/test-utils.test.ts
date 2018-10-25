import { ApolloServerBase, gql } from '../';
import { processGraphQLRequest, GraphQLRequest } from '../requestPipeline';

/**
@Jake @james yep, `processGraphQLRequest` is the entry point to the request
pipeline. with an incoming HTTP request this is invoked by `runHttpQuery`, but
for testing we'd want to call it directly.

so we should add a method (`executeOperation`?) to `ApolloServerBase` that calls
`processGraphQLRequest` with the right request context (filing in the schema,
context, etc. with properties from the server instance). (edited)
 */

const createClient = (server, ctxFn) => {
  // if a context fn is required, overwrite the old one
  // allows easy mocking of the context
  if (ctxFn) server.context = ctxFn;

  return {
    query: () => {},
    mutate: () => {},
    watchQuery: () => {},
    subscribe: () => {},
  };
};

describe('createClient', () => {
  const typeDefs = gql`
    type Query {
      hello: String
    }
  `;

  const resolvers = {
    Query: {
      hello: (_, vars, context) => {
        return `${context.hello} + ${vars.hello}`;
      },
    },
    // Mutation: {
    //   foo: (_, __, context) => '',
    // },
  };

  const myTestServer = new ApolloServerBase({
    typeDefs,
    context: () => ({ hello: 'world' }),
    resolvers,
  });

  const query = gql`
    {
      hello
    }
  `;

  it('allows querying', () => {
    console.log(Object.keys(myTestServer));

    // const client = createClient(myTestServer);
    // expect(client.query({ query })).toEqual({ data: { hello: 'world' } });
  });

  xit('allows mocking of context', () => {
    const client = createClient(myTestServer, () => ({ hello: 'boo!' }));
    expect(client.query({ query })).toEqual('boo!');
  });
});
