import gql from 'graphql-tag';
import type { DocumentNode } from 'graphql';

import { ApolloServerBase } from '../ApolloServer';
import assert from 'assert';
import { UnboundedCache } from '../utils/UnboundedCache';

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello() {
      return 'world';
    },
  },
};

// allow us to access internals of the class
class ApolloServerObservable extends ApolloServerBase {
  override graphQLServerOptions() {
    return super.graphQLServerOptions();
  }
}

const documentNodeMatcher = {
  kind: 'Document',
  definitions: expect.any(Array),
  loc: {
    start: 0,
    end: 15,
  },
};

const operations = {
  simple: {
    op: { query: 'query { hello }' },
    hash: 'ec2e01311ab3b02f3d8c8c712f9e579356d332cd007ac4c1ea5df727f482f05f',
  },
};

describe('ApolloServerBase documentStore', () => {
  it('documentStore - undefined', async () => {
    const server = new ApolloServerObservable({
      typeDefs,
      resolvers,
    });

    await server.start();

    const options = await server.graphQLServerOptions();
    const embeddedStore = options.documentStore;
    assert(embeddedStore);
    expect(embeddedStore).toBeInstanceOf(UnboundedCache);

    await server.executeOperation(operations.simple.op);

    expect(await embeddedStore.get(operations.simple.hash)).toMatchObject(
      documentNodeMatcher,
    );
  });

  it('documentStore - custom', async () => {
    const documentStore = {
      get: async function (key: string) {
        return cache[key];
      },
      set: async function (key: string, val: DocumentNode) {
        cache[key] = val;
      },
      delete: async function () {},
    };
    const cache: Record<string, DocumentNode> = {};

    const getSpy = jest.spyOn(documentStore, 'get');
    const setSpy = jest.spyOn(documentStore, 'set');

    const server = new ApolloServerBase({
      typeDefs,
      resolvers,
      documentStore,
    });
    await server.start();

    await server.executeOperation(operations.simple.op);

    const keys = Object.keys(cache);
    expect(keys).toHaveLength(1);
    const theKey = keys[0];
    expect(theKey.split(':')).toHaveLength(2);
    expect(theKey.split(':')[1]).toEqual(operations.simple.hash);
    expect(cache[theKey]).toMatchObject(documentNodeMatcher);

    await server.executeOperation(operations.simple.op);

    expect(Object.keys(cache)).toEqual([theKey]);

    expect(getSpy.mock.calls.length).toBe(2);
    expect(setSpy.mock.calls.length).toBe(1);
  });

  it('documentStore - null', async () => {
    const server = new ApolloServerObservable({
      typeDefs,
      resolvers,
      documentStore: null,
    });

    await server.start();

    const options = await server.graphQLServerOptions();
    expect(options.documentStore).toBe(null);

    const result = await server.executeOperation(operations.simple.op);

    expect(result.data).toEqual({ hello: 'world' });
  });

  it('documentStore with changing schema', async () => {});
});
