import { KeyValueCache } from 'apollo-server-caching';
import Memcached from 'memcached';
import { promisify } from 'util';

export default class MemcachedKeyValueCache implements KeyValueCache {
  readonly client;
  readonly defaultSetOptions = {
    ttl: 300,
  };

  constructor(serverLocation: Memcached.Location, options?: Memcached.options) {
    this.client = new Memcached(serverLocation, options);
    // promisify client calls for convenience
    this.client.get = promisify(this.client.get).bind(this.client);
    this.client.set = promisify(this.client.set).bind(this.client);
    this.client.flush = promisify(this.client.flush).bind(this.client);
  }

  async set(
    key: string,
    data: string,
    options?: { ttl?: number },
  ): Promise<void> {
    const { ttl } = Object.assign({}, this.defaultSetOptions, options);
    await this.client.set(key, data, ttl);
  }

  async get(key: string): Promise<string | undefined> {
    return await this.client.get(key);
  }

  async flush(): Promise<void> {
    await this.client.flush();
  }

  async close(): Promise<void> {
    this.client.end();
  }
}
