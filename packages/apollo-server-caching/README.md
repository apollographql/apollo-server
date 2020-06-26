# apollo-server-caching

[![npm version](https://badge.fury.io/js/apollo-server-caching.svg)](https://badge.fury.io/js/apollo-server-caching)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)

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

You can export and run a jest test suite from `apollo-server-caching` to test your implementation:

```typescript
// ../__tests__/YourKeyValueCache.test.ts

import YourKeyValueCache from '../src/YourKeyValueCache';
import { testKeyValueCache } from 'apollo-server-caching';
testKeyValueCache(new MemcachedCache('localhost'));
```

The default `testKeyValueCache` helper will run all key-value store tests on the specified store, including basic `get` and `set` functionality, along with time-based expunging rules.

Some key-value cache implementations may not be able to support the full suite of tests (for example, some tests might not be able to expire based on time).  For those cases, there are more granular implementations which can be used:

* `testKeyValueCache_Basic`
* `testKeyValueCache_Expiration`

For more details, consult the [source for `apollo-server-caching`](./src/__tests__/testsuite.ts).

### Running tests

Run tests with `jest --verbose`
