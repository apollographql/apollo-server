import {
  TestableKeyValueCache,
  KeyValueCacheSetOptions,
} from 'apollo-server-caching';
import DataLoader from 'dataloader';

export interface RedisClient {
  set: (key: string, value: string, option?: string, optionValue?: number) => Promise<any>
  mget: (...key: Array<string>) => Promise<Array<string | null>>
  flushdb: () => Promise<any>
  del: (key: string) => Promise<number>
  quit: () => Promise<any>
}

export class BaseRedisCache implements TestableKeyValueCache<string> {
  readonly client: RedisClient;
  readonly defaultSetOptions: KeyValueCacheSetOptions = {
    ttl: 300,
  };

  private loader: DataLoader<string, string | null>;

  constructor(client: RedisClient) {
    this.client = client;

    this.loader = new DataLoader(keys => client.mget(...keys), {
      cache: false,
    });
  }

  async set(
    key: string,
    value: string,
    options?: KeyValueCacheSetOptions,
  ): Promise<void> {
    const { ttl } = Object.assign({}, this.defaultSetOptions, options);
    if (typeof ttl === 'number') {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      // We'll leave out the EXpiration when no value is specified.  Of course,
      // it may be purged from the cache for other reasons as deemed necessary.
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | undefined> {
    const reply = await this.loader.load(key);
    if (reply !== null) {
      return reply;
    }
    return;
  }

  async delete(key: string): Promise<boolean> {
    return await this.client.del(key) > 0;
  }

  // Drops all data from Redis. This should only be used by test suites ---
  // production code should never drop all data from an end user Redis cache!
  async flush(): Promise<void> {
    await this.client.flushdb();
  }

  async close(): Promise<void> {
    await this.client.quit();
    return;
  }
}
