import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import {
  GraphQLExtensionStack,
  enableGraphQLExtensions,
} from 'graphql-extensions';
import { Trace } from 'apollo-engine-reporting-protobuf';
import { graphql } from 'graphql';
import { Request } from 'node-fetch';
import { GraphQLRequestContext } from 'apollo-server-core/dist/requestPipelineAPI';
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

  const requestContext: GraphQLRequestContext<any> = {
    request: {
      http: new Request('http://localhost:123/foo'),
      extensions: {
        clientName: 'testing suite',
      },
    },
    originalDocumentString: query,
    operationName: 'q',
    context: {},
    cache: new InMemoryLRUCache(),
  };
  const reportingExtension = new EngineReportingExtension(
    {},
    addTrace,
    requestContext,
  );
  requestContext.context._extensionStack = new GraphQLExtensionStack([
    reportingExtension.__graphqlExtension(),
  ]);

  await reportingExtension.didResolveDocument(requestContext as any);
  await reportingExtension.didResolveOperation(requestContext as any);
  await graphql({
    schema,
    source: query,
    contextValue: requestContext.context,
  });
  await reportingExtension.willSendResponse(requestContext as any);

  expect(traces.length).toBe(1);
  expect(traces[0].operationName).toBe('q');
  // XXX actually write some tests
});
