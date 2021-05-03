# apollo-server-caching

[![npm version](https://badge.fury.io/js/apollo-server-caching.svg)](https://badge.fury.io/js/apollo-server-caching)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server/tree/main.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)

## Implementing your own Cache

Internally, Apollo Server uses the `KeyValueCache` interface to provide a caching store for the Data Sources. An in-memory LRU cache is used by default, and we provide connectors for [Memcached](../apollo-server-cache-memcached)/[Redis](../apollo-server-cache-redis) backends.

Built with extensibility in mind, you can also implement your own cache to use with Apollo Server, in a way that best suits your application needs. It needs to implement the following interface that can be exported from `apollo-server-caching`:

```typescript
export interface KeyValueCache {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string, options?: { ttl?: number }): Promise<void>;
}
```

> The `ttl` value for the `set` method's `options` is specified in __seconds__.

## Testing cache implementations

### Test helpers

`apollo-server-caching` exports a function that you can run within a test suite to validate your implementation. It throws on failure. If you want to test expiration, then mock out `Date` and `setTimeout` (probably with `@sinonjs/fake-timers`) and pass a `tick` can be called to advance the fake time. (If you don't pass `tick`, it won't test expiration.) Other than that, it has no dependencies and can work in any test system and shouldn't require any particular build configuration to use from jest. Here's an example of how to use it with jest:

```typescript
// ../__tests__/YourKeyValueCache.test.ts

import YourKeyValueCache from '../src/YourKeyValueCache';
import { runKeyValueCacheTests } from 'apollo-server-caching';
import FakeTimers from '@sinonjs/fake-timers';

describe('YourKeyValueCache', () => {
  it('run apollo-server-caching test suite', async () => {
    const cache = new YourKeyValueCache();
    const clock = FakeTimers.install();
    try {
      await runKeyValueCacheTests(cache, (ms: number) => clock.tick(ms));
    } finally {
      clock.uninstall();
      await cache.close();
    }
  });
});
```

For more details, consult the [source for `apollo-server-caching`](./src/testsuite.ts).

### Running tests

Run tests with `jest --verbose`
