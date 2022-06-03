import assert from 'assert';
import type { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { ApolloServer } from '../ApolloServer';

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

const documentNodeMatcher = {
  kind: 'Document',
  definitions: expect.any(Array),
  loc: {
    start: 0,
    end: 15,
  },
};

const hash = 'ec2e01311ab3b02f3d8c8c712f9e579356d332cd007ac4c1ea5df727f482f05f';
const operations = {
  simple: {
    op: { query: 'query { hello }' },
    hash,
  },
};

describe('ApolloServer documentStore', () => {
  it('documentStore - undefined', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    await server.start();

    // Use [] syntax to access a private method.
    const { schemaManager } = await server['_ensureStarted']();
    const { documentStore } = schemaManager.getSchemaDerivedData();
    assert(documentStore);
    expect(documentStore).toBeInstanceOf(InMemoryLRUCache);

    await server.executeOperation(operations.simple.op);

    expect(documentStore['cache'].calculatedSize).toBe(403);

    expect(await documentStore.get(operations.simple.hash)).toMatchObject(
      documentNodeMatcher,
    );
  });

  it('documentStore - custom', async () => {
    const documentStore = new InMemoryLRUCache<DocumentNode>({
      maxSize: 2000,
    });

    const getSpy = jest.spyOn(documentStore, 'get');
    const setSpy = jest.spyOn(documentStore, 'set');

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      documentStore,
    });
    await server.start();

    await server.executeOperation(operations.simple.op);
    const keys = documentStore.keys();
    expect(keys).toHaveLength(1);
    const theKey = keys[0];
    const [uuid, hash] = theKey.split(':');
    expect(typeof uuid).toBe('string');
    expect(hash).toEqual(operations.simple.hash);

    const result = await documentStore.get(`${uuid}:${hash}`);
    expect(result).toMatchObject(documentNodeMatcher);

    await server.executeOperation(operations.simple.op);

    // one of these calls is ours
    expect(getSpy.mock.calls.length).toBe(2 + 1);
    expect(setSpy.mock.calls.length).toBe(1);
  });

  it('documentStore - null', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      documentStore: null,
    });

    await server.start();

    // Use [] syntax to access a private method.
    const { documentStore } = (
      await server['_ensureStarted']()
    ).schemaManager.getSchemaDerivedData();
    expect(documentStore).toBeNull();

    const { result } = await server.executeOperation(operations.simple.op);

    expect(result.data).toEqual({ hello: 'world' });
  });

  it('documentStore with changing schema', async () => {});
});
