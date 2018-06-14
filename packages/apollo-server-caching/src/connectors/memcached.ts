import { KeyValueCache } from '../keyValueCache';
import Memcached from 'memcached';
import { promisify } from 'util';

export default class MemcachedKeyValueCache implements KeyValueCache {
  readonly client;
  readonly defaultSetOptions = {
    ttl: 300,
    tags: [],
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
    options?: { ttl?: number; tags?: string[] },
  ): Promise<void> {
    const { ttl } = Object.assign({}, this.defaultSetOptions, options);

    try {
      await this.client.set(key, data, ttl);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async get(key: string): Promise<string | undefined> {
    try {
      const reply = await this.client.get(key);
      return Promise.resolve(reply);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flush();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async close(): Promise<void> {
    this.client.end();
  }
}
