import { KeyValueCache } from '../keyValueCache';
import Redis from 'redis';
import { promisify } from 'util';

export default class RedisKeyValueCache implements KeyValueCache {
  readonly client;
  readonly defaultSetOptions = {
    ttl: 300,
    tags: [],
  };

  constructor(options: Redis.ClientOpts) {
    this.client = Redis.createClient(options);
    // promisify client calls for convenience
    this.client.get = promisify(this.client.get).bind(this.client);
    this.client.set = promisify(this.client.set).bind(this.client);
    this.client.flushdb = promisify(this.client.flushdb).bind(this.client);
    this.client.quit = promisify(this.client.quit).bind(this.client);
  }

  async set(
    key: string,
    data: string,
    options?: { ttl?: number; tags?: string[] },
  ): Promise<void> {
    const { ttl } = Object.assign({}, this.defaultSetOptions, options);
    try {
      await this.client.set(key, data, 'EX', ttl);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async get(key: string): Promise<string | undefined> {
    try {
      const reply = await this.client.get(key);
      // reply is null if key is not found
      if (reply === null) {
        return Promise.resolve(undefined);
      } else {
        return Promise.resolve(reply);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushdb();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async close(): Promise<void> {
    try {
      await this.client.quit();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
