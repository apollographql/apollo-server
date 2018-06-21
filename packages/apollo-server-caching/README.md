## Implementing your own Cache

Internally, Apollo Server uses the `KeyValueCache` interface to provide a caching store for the Data Sources. An in-memory LRU cache is used by default, and we provide connectors for [Memcached](../apollo-server-memcached)/[Redis](../apollo-server-redis) backends.

Built with extensibility in mind, you can also implement your own cache to use with Apollo Server, in a way that best suits your application needs. It needs to implement the following interface that can be exported from `apollo-server-caching`:

```typescript
export interface KeyValueCache {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string, options?: { ttl?: number }): Promise<void>;
}
```

## Running test suite

You can export and run a jest test suite from `apollo-server-caching` to test your implementation:

```typescript
// ../__tests__/YourKeyValueCache.test.ts

import YourKeyValueCache from '../src/YourKeyValueCache';
import { testKeyValueCache } from 'apollo-server-caching';
testKeyValueCache(new MemcachedCache('localhost'));
```

Run tests with `jest --verbose`
