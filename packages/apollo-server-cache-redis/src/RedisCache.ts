import { KeyValueCache } from 'apollo-server-caching';
import Redis, { RedisOptions } from 'ioredis';
import DataLoader from 'dataloader';

export class RedisCache implements KeyValueCache {
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
    data: string,
    options?: { ttl?: number },
  ): Promise<void> {
    const { ttl } = Object.assign({}, this.defaultSetOptions, options);
    await this.client.set(key, data, 'EX', ttl);
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

  async flush(): Promise<void> {
    await this.client.flushdb();
  }

  async close(): Promise<void> {
    await this.client.quit();
    return;
  }
}
