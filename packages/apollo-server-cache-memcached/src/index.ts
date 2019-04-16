import { TestableKeyValueCache } from 'apollo-server-caching';
import Memcached from 'memcached';
import { promisify } from 'util';

export class MemcachedCache implements TestableKeyValueCache {
  // FIXME: Replace any with proper promisified type
  readonly client: any;
  readonly defaultSetOptions = {
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
    options?: { ttl?: number },
  ): Promise<void> {
    const { ttl } = Object.assign({}, this.defaultSetOptions, options);
    await this.client.set(key, value, ttl);
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
