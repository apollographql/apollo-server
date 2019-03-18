import { TestableKeyValueCache } from 'apollo-server-caching';
import Redis from 'redis';
import { promisify } from 'util';
import DataLoader from 'dataloader';

export class RedisCache implements TestableKeyValueCache<string> {
  // FIXME: Replace any with proper promisified type
  readonly client: any;
  readonly defaultSetOptions = {
    ttl: 300,
  };

  private loader: DataLoader<string, string>;

  constructor(options: Redis.ClientOpts) {
    const client = Redis.createClient(options) as any;

    // promisify client calls for convenience
    client.del = promisify(client.del).bind(client);
    client.mget = promisify(client.mget).bind(client);
    client.set = promisify(client.set).bind(client);
    client.flushdb = promisify(client.flushdb).bind(client);
    client.quit = promisify(client.quit).bind(client);

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
    // reply is null if key is not found
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
