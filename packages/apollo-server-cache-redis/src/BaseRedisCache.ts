import {
  TestableKeyValueCache,
  KeyValueCacheSetOptions,
} from 'apollo-server-caching';
import DataLoader from 'dataloader';

interface BaseRedisClient {
  set: (
    key: string,
    value: string,
    option?: string,
    optionValue?: number,
  ) => Promise<any>;
  flushdb: () => Promise<any>;
  del: (key: string) => Promise<number>;
  quit: () => Promise<any>;
}

export interface RedisClient extends BaseRedisClient {
  mget: (...key: Array<string>) => Promise<Array<string | null>>;
}

export interface RedisNoMgetClient extends BaseRedisClient {
  get: (key: string) => Promise<string | null>;
}

/**
 * Provide exactly one of the options `client` and `noMgetClient`. `client` is
 * a client that supports the `mget` multiple-get command.
 *
 * ioredis does not support `mget` for cluster mode (see
 * https://github.com/luin/ioredis/issues/811), so if you're using cluster mode,
 * pass `noMgetClient` instead, which has a `get` method instead of `mget`;
 * this package will issue parallel `get` commands instead of a single `mget`
 * command if `noMgetClient` is provided.
 */
export interface BaseRedisCacheOptions {
  client?: RedisClient;
  noMgetClient?: RedisNoMgetClient;
}

export class BaseRedisCache implements TestableKeyValueCache<string> {
  readonly client: BaseRedisClient;
  readonly defaultSetOptions: KeyValueCacheSetOptions = {
    ttl: 300,
  };

  private loader: DataLoader<string, string | null>;

  constructor(options: BaseRedisCacheOptions) {
    const { client, noMgetClient } = options;
    if (client && noMgetClient) {
      throw Error('You may only provide one of `client` and `noMgetClient`');
    } else if (client) {
      this.client = client;
      this.loader = new DataLoader((keys) => client.mget(...keys), {
        cache: false,
      });
    } else if (noMgetClient) {
      this.client = noMgetClient;
      this.loader = new DataLoader(
        (keys) =>
          Promise.all(keys.map((key) => noMgetClient.get(key).catch(() => null))),
        {
          cache: false,
        },
      );
    } else {
      throw Error('You must provide `client` or `noMgetClient`');
    }
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
    return (await this.client.del(key)) > 0;
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
