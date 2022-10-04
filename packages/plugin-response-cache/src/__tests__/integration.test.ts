import {
  ApolloServer,
  GraphQLRequest,
  GraphQLRequestContext,
} from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import ApolloServerPluginResponseCache from '../index.js';
import request, { type Response } from 'supertest';
import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Response caching', () => {
  beforeAll(() => {
    // This explicitly mocks only `Date`. The `Date` mock is utilized by the
    // `ApolloServerPluginResponseCache` (for `age` and `cacheTime`
    // calculation). It's also used by the `FakeableTTLTestingCache` which is
    // implemented at the bottom of this file. See comments on the cache
    // implementation for more details.
    jest.useFakeTimers({
      doNotFake: [
        'hrtime',
        'nextTick',
        'performance',
        'queueMicrotask',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'requestIdleCallback',
        'cancelIdleCallback',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
      ],
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('basic caching', async () => {
    const typeDefs = `#graphql
      type Query {
        cached: String @cacheControl(maxAge: 10)
        asyncCached: String @cacheControl(maxAge: 10)
        asyncUncached: String @cacheControl(maxAge: 10)
        asyncNoWrite: String @cacheControl(maxAge: 10)
        uncached: String
        private: String @cacheControl(maxAge: 9, scope: PRIVATE)
      }
      enum CacheControlScope {
        PUBLIC
        PRIVATE
      }
      directive @cacheControl(
        maxAge: Int
        scope: CacheControlScope
      ) on FIELD_DEFINITION | OBJECT | INTERFACE
    `;

    type FieldName =
      | 'cached'
      | 'asyncCached'
      | 'asyncUncached'
      | 'asyncNoWrite'
      | 'uncached'
      | 'private';
    const fieldNames: FieldName[] = [
      'cached',
      'asyncCached',
      'asyncUncached',
      'asyncNoWrite',
      'uncached',
      'private',
    ];
    const resolverCallCount = {} as Record<FieldName, number>;
    const expectedResolverCallCount = {} as Record<FieldName, number>;
    const expectCacheHit = (fn: FieldName) =>
      expect(resolverCallCount[fn]).toBe(expectedResolverCallCount[fn]);
    const expectCacheMiss = (fn: FieldName) =>
      expect(resolverCallCount[fn]).toBe(++expectedResolverCallCount[fn]);

    const resolvers = {
      Query: {} as Record<FieldName, () => string>,
    };
    fieldNames.forEach((name) => {
      resolverCallCount[name] = 0;
      expectedResolverCallCount[name] = 0;
      resolvers.Query[name] = () => {
        resolverCallCount[name]++;
        return `value:${name}`;
      };
    });

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      // This cache replaces the default `InMemoryCache` which has proven
      // difficult to mock (see note above for more details).
      cache: new FakeableTTLTestingCache(),
      plugins: [
        ApolloServerPluginResponseCache({
          async sessionId(requestContext: GraphQLRequestContext<any>) {
            return (
              requestContext.request.http!.headers.get('session-id') || null
            );
          },
          async extraCacheKeyData(requestContext: GraphQLRequestContext<any>) {
            return (
              requestContext.request.http!.headers.get(
                'extra-cache-key-data',
              ) || null
            );
          },
          async shouldReadFromCache(
            requestContext: GraphQLRequestContext<any>,
          ) {
            if (requestContext.request.http!.headers.get('no-read-from-cache'))
              return false;

            if (requestContext.request.query!.indexOf('asyncCached') >= 0) {
              return new Promise((resolve) => resolve(true));
            }

            if (requestContext.request.query!.indexOf('asyncUncached') >= 0) {
              return new Promise((resolve) => resolve(false));
            }

            return true;
          },
          async shouldWriteToCache(requestContext: GraphQLRequestContext<any>) {
            if (requestContext.request.http!.headers.get('no-write-to-cache'))
              return false;

            if (requestContext.request.query!.indexOf('asyncNoWrite') >= 0) {
              return new Promise((resolve) => resolve(false));
            }

            return true;
          },
        }),
      ],
    });

    const { url } = await startStandaloneServer(server, {
      listen: { port: 0 },
    });

    function httpHeader(result: Response, header: string): string | null {
      const value = result.headers[header] ?? null;
      if (header === 'cache-control' && value === 'no-cache') {
        return null;
      }
      return value;
    }

    const basicQuery = '{ cached }';
    type FetchOptions = GraphQLRequest & { headers?: Record<string, string> };
    async function fetch(opts?: FetchOptions) {
      const result = await request(url)
        .post('/')
        .type('application/json')
        .set(opts?.headers ?? {})
        .send({ query: opts?.query ?? basicQuery });
      return result;
    }

    // Cache miss
    {
      const result = await fetch();
      expect(result.body.data.cached).toBe('value:cached');
      expectCacheMiss('cached');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
      expect(httpHeader(result, 'age')).toBe(null);
    }

    // Cache hit
    {
      const result = await fetch();
      expect(result.body.data.cached).toBe('value:cached');
      expectCacheHit('cached');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
      expect(httpHeader(result, 'age')).toBe('0');
    }

    // Cache hit partway to ttl.
    jest.advanceTimersByTime(5 * 1000);
    {
      const result = await fetch();
      expect(result.body.data.cached).toBe('value:cached');
      expectCacheHit('cached');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
      expect(httpHeader(result, 'age')).toBe('5');
    }

    // Cache miss after ttl.
    jest.advanceTimersByTime(6 * 1000);
    {
      const result = await fetch();
      expect(result.body.data.cached).toBe('value:cached');
      expectCacheMiss('cached');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
      expect(httpHeader(result, 'age')).toBe(null);
    }

    // Cache hit async
    {
      const result = await fetch({ query: '{asyncCached}' });
      expect(result.body.data.asyncCached).toBe('value:asyncCached');
      expectCacheMiss('asyncCached');
    }

    {
      const result = await fetch({ query: '{asyncCached}' });
      expect(result.body.data.asyncCached).toBe('value:asyncCached');
      expectCacheHit('asyncCached');
    }

    // Cache Miss async
    {
      const result = await fetch({ query: '{asyncUncached}' });
      expect(result.body.data.asyncUncached).toBe('value:asyncUncached');
      expectCacheMiss('asyncUncached');
    }

    {
      const result = await fetch({ query: '{asyncUncached}' });
      expect(result.body.data.asyncUncached).toBe('value:asyncUncached');
      expectCacheMiss('asyncUncached');
    }

    // Even we cache read, we did not write (async)
    {
      const asyncNoWriteQuery = '{asyncNoWrite}';
      await fetch({
        query: asyncNoWriteQuery,
      });
      expectCacheMiss('asyncNoWrite');

      const result = await fetch({
        query: asyncNoWriteQuery,
      });
      expectCacheMiss('asyncNoWrite');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
    }

    // Cache hit.
    {
      const result = await fetch();
      expectCacheHit('cached');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
      expect(httpHeader(result, 'age')).toBe('0');
    }

    // For now, caching is based on the original document text, not the AST,
    // so this should be a cache miss.
    {
      const result = await fetch({
        query: '{       cached           }',
      });
      expect(result.body.data.cached).toBe('value:cached');
      expectCacheMiss('cached');
    }

    // This definitely should be a cache miss because the output is different.
    {
      const result = await fetch({
        query: '{alias: cached}',
      });
      expect(result.body.data.alias).toBe('value:cached');
      expectCacheMiss('cached');
    }

    // Reading both a cached and uncached data should not get cached (it's a
    // full response cache).
    {
      const result = await fetch({
        query: '{cached uncached}',
      });
      expect(result.body.data.cached).toBe('value:cached');
      expect(result.body.data.uncached).toBe('value:uncached');
      expectCacheMiss('cached');
      expectCacheMiss('uncached');
      expect(httpHeader(result, 'cache-control')).toBe('no-store');
      expect(httpHeader(result, 'age')).toBe(null);
    }

    // Just double-checking that it didn't get cached.
    {
      const result = await fetch({
        query: '{cached uncached}',
      });
      expect(result.body.data.cached).toBe('value:cached');
      expect(result.body.data.uncached).toBe('value:uncached');
      expectCacheMiss('cached');
      expectCacheMiss('uncached');
      expect(httpHeader(result, 'cache-control')).toBe('no-store');
      expect(httpHeader(result, 'age')).toBe(null);
    }

    // Let's just remind ourselves that the basic query is cacheable.
    {
      await fetch({ query: basicQuery });
      expectCacheHit('cached');
    }

    // But if we give it some extra cache key data, it'll be cached separately.
    {
      const result = await fetch({
        query: basicQuery,
        headers: { 'extra-cache-key-data': 'foo' },
      });
      expect(result.body.data.cached).toBe('value:cached');
      expectCacheMiss('cached');
    }

    // But if we give it the same extra cache key data twice, it's a hit.
    {
      const result = await fetch({
        query: basicQuery,
        headers: { 'extra-cache-key-data': 'foo' },
      });
      expect(result.body.data.cached).toBe('value:cached');
      expectCacheHit('cached');
    }

    // Without a session ID, private fields won't be cached.
    {
      const result = await fetch({
        query: '{private}',
      });
      expect(result.body.data.private).toBe('value:private');
      expectCacheMiss('private');
      // Note that the HTTP header calculator doesn't know about session
      // IDs, so it'll still tell HTTP-level caches to cache this, albeit
      // privately.
      expect(httpHeader(result, 'cache-control')).toBe('max-age=9, private');
      expect(httpHeader(result, 'age')).toBe(null);
    }

    // See?
    {
      const result = await fetch({
        query: '{private}',
      });
      expect(result.body.data.private).toBe('value:private');
      expectCacheMiss('private');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=9, private');
    }

    // OK, how about with a session ID.  First try should be a miss.
    {
      const result = await fetch({
        query: '{private}',
        headers: { 'session-id': 'foo' },
      });
      expect(result.body.data.private).toBe('value:private');
      expectCacheMiss('private');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=9, private');
    }

    // But next try should be a hit.
    {
      const result = await fetch({
        query: '{private}',
        headers: { 'session-id': 'foo' },
      });
      expect(result.body.data.private).toBe('value:private');
      expectCacheHit('private');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=9, private');
    }

    // But a different session ID should be a miss again.
    {
      const result = await fetch({
        query: '{private}',
        headers: { 'session-id': 'bar' },
      });
      expect(result.body.data.private).toBe('value:private');
      expectCacheMiss('private');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=9, private');
    }

    // As should be no session.
    {
      const result = await fetch({
        query: '{private}',
      });
      expect(result.body.data.private).toBe('value:private');
      expectCacheMiss('private');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=9, private');
    }

    // Let's remind ourselves once again that the basic (public) query is *still* cached.
    {
      const result = await fetch({ query: basicQuery });
      expectCacheHit('cached');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
    }

    // If you're logged in, though, you get your own cache shared with all
    // other authenticated users (the "authenticated public" cache), so this
    // is a miss. It's still a public cache, though, for the HTTP header.
    // XXX Does that makes sense? Maybe this should be private, or maybe we
    // should drop the entire "authenticated public" concept.
    {
      const result = await fetch({
        query: basicQuery,
        headers: { 'session-id': 'bar' },
      });
      expect(result.body.data.cached).toBe('value:cached');
      expectCacheMiss('cached');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
    }

    // See, this other session sees it!
    {
      const result = await fetch({
        query: basicQuery,
        headers: { 'session-id': 'baz' },
      });
      expect(result.body.data.cached).toBe('value:cached');
      expectCacheHit('cached');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
      expect(httpHeader(result, 'age')).toBe('0');
    }

    // Let's continue to remind ourselves that the basic (public) query is *still* cached.
    {
      const result = await fetch({ query: basicQuery });
      expectCacheHit('cached');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
    }

    // But what if we specifically ask to not read from the cache?
    {
      const result = await fetch({
        query: basicQuery,
        headers: { 'no-read-from-cache': 'y' },
      });
      expect(result.body.data.cached).toBe('value:cached');
      expectCacheMiss('cached');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
    }

    // Let's expire the cache, and run again, not writing to the cache.
    jest.advanceTimersByTime(15 * 1000);
    {
      const result = await fetch({
        query: basicQuery,
        headers: { 'no-write-to-cache': 'y' },
      });
      expect(result.body.data.cached).toBe('value:cached');
      expectCacheMiss('cached');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
    }

    // And now verify that in fact we did not write!
    {
      const result = await fetch({
        query: basicQuery,
      });
      expect(result.body.data.cached).toBe('value:cached');
      expectCacheMiss('cached');
      expect(httpHeader(result, 'cache-control')).toBe('max-age=10, public');
    }

    await server.stop();
  });
});

// The default AS cache (`InMemoryLRUCache`) uses `lru-cache` internally, which
// we've had issues mocking timers for. Presumably this has something to do with
// the way that `lru-cache` grabs its `perf` function:
// https://github.com/isaacs/node-lru-cache/blob/118a078cc0ea3a17f7b2ff4caf04e6aa3a33b136/index.js#L1-L6
// This test suite already mocks `Date` (because
// `ApolloServerPluginResponseCache` uses it internally), so we used that for
// time calculation in this mock cache as well.
class FakeableTTLTestingCache {
  constructor(
    private cache: Map<
      string,
      { value: string; deadline: number | null }
    > = new Map(),
  ) {}

  async get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (entry.deadline && entry.deadline <= Date.now()) {
      await this.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async set(
    key: string,
    value: string,
    { ttl }: { ttl: number | null } = { ttl: null },
  ) {
    this.cache.set(key, {
      value,
      deadline: ttl ? Date.now() + ttl * 1000 : null,
    });
  }

  async delete(key: string) {
    this.cache.delete(key);
  }
}
