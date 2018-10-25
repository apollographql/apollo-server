import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import {
  GraphQLExtensionStack,
  enableGraphQLExtensions,
} from 'graphql-extensions';
import { Trace } from 'apollo-engine-reporting-protobuf';
import { graphql } from 'graphql';
import { Request } from 'node-fetch';
import { EngineReportingExtension } from '../extension';
import { InMemoryLRUCache } from 'apollo-server-caching';

test('trace construction', async () => {
  const typeDefs = `
  type User {
    id: Int
    name: String
    posts(limit: Int): [Post]
  }

  type Post {
    id: Int
    title: String
    views: Int
    author: User
  }

  type Query {
    aString: String
    aBoolean: Boolean
    anInt: Int
    author(id: Int): User
    topPosts(limit: Int): [Post]
  }
`;

  const query = `
    query q {
      author(id: 5) {
        name
        posts(limit: 2) {
          id
        }
      }
      aBoolean
    }
`;

  const schema = makeExecutableSchema({ typeDefs });
  addMockFunctionsToSchema({ schema });
  enableGraphQLExtensions(schema);

  const traces: Array<any> = [];
  function addTrace(signature: string, operationName: string, trace: Trace) {
    traces.push({ signature, operationName, trace });
  }

  const reportingExtension = new EngineReportingExtension({}, addTrace);
  const stack = new GraphQLExtensionStack([reportingExtension]);
  const requestDidEnd = stack.requestDidStart({
    request: new Request('http://localhost:123/foo') as any,
    queryString: query,
    requestContext: {
      request: {
        query,
        operationName: 'q',
        extensions: {
          clientName: 'testing suite',
        },
      },
      context: {},
      cache: new InMemoryLRUCache(),
    },
  });
  await graphql({
    schema,
    source: query,
    contextValue: { _extensionStack: stack },
  });
  requestDidEnd();
  // XXX actually write some tests
});
