import { KeyValueCache } from '../keyValueCache';
import Memcached from 'memcached';
import { promisify } from 'util';
import uuid from 'uuid/v4';

export default class MemcachedKeyValueCache implements KeyValueCache {
  readonly client;
  readonly defaultSetOptions = {
    ttl: 300,
    tags: [],
  };

  private versionSeed = Math.floor(Math.random() * 100 + 1);

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
    const { ttl, tags } = Object.assign({}, this.defaultSetOptions, options);

    try {
      // generate version number
      const version = uuid();

      const setOperations = [{ key, data: version + data, ttl }];
      await this.client.set(key, data, ttl);

      // store each of the tags with corresponding version number
      for (const tag of tags) {
        setOperations.push({ tag });
        await this;
      }

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
