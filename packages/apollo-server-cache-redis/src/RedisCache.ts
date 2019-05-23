import { TestableKeyValueCache } from 'apollo-server-caching';
import Redis, { RedisOptions } from 'ioredis';
import DataLoader from 'dataloader';

export class RedisCache implements TestableKeyValueCache<string> {
  readonly client: any;
  readonly defaultSetOptions = {
    ttl: 300,
  };

  private loader: DataLoader<string, string>;

  constructor(options?: RedisOptions) {
    const client = new Redis(options);
    this.client = client;

    this.loader = new DataLoader(keys => this.client.mget(keys), {
      cache: false,
    });
  }

  async set(
    key: string,
    value: string,
    options?: { ttl?: number },
  ): Promise<void> {
    const { ttl } = Object.assign({}, this.defaultSetOptions, options);
    await this.client.set(key, value, 'EX', ttl);
  }

  async get(key: string): Promise<string | undefined> {
    const reply = await this.loader.load(key);
    if (reply !== null) {
      return reply;
    }
    return;
  }

  async delete(key: string): Promise<boolean> {
    return await this.client.del(key);
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
