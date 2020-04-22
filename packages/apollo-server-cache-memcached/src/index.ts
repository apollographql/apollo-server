import {
  TestableKeyValueCache,
  KeyValueCacheSetOptions,
} from 'apollo-server-caching';
import Memcached from 'memcached';
import { promisify } from 'util';

export class MemcachedCache implements TestableKeyValueCache {
  // FIXME: Replace any with proper promisified type
  readonly client: any;
  readonly defaultSetOptions: KeyValueCacheSetOptions = {
    ttl: 300,
  };

  constructor(serverLocation: Memcached.Location, options?: Memcached.options) {
    const client = new Memcached(serverLocation, options);
    // promisify client calls for convenience
    client.del = promisify(client.del).bind(client);
    client.get = promisify(client.get).bind(client);
    client.set = promisify(client.set).bind(client);
    client.flush = promisify(client.flush).bind(client);

    this.client = client;
  }

  async set(
    key: string,
    value: string,
    options?: KeyValueCacheSetOptions,
  ): Promise<void> {
    const { ttl } = Object.assign({}, this.defaultSetOptions, options);
    if (typeof ttl === 'number') {
      await this.client.set(key, value, ttl);
    } else {
      // In Memcached, zero indicates no specific expiration time.  Of course,
      // it may be purged from the cache for other reasons as deemed necessary.
      await this.client.set(key, value, 0);
    }
  }

  async get(key: string): Promise<string | undefined> {
    return await this.client.get(key);
  }

  async delete(key: string): Promise<boolean> {
    return await this.client.del(key);
  }

  // Drops all data from Memcached. This should only be used by test suites ---
  // production code should never drop all data from an end user cache.
  async flush(): Promise<void> {
    await this.client.flush();
  }

  async close(): Promise<void> {
    this.client.end();
  }
}
