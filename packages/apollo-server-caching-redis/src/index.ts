import { KeyValueCache } from 'apollo-server-caching';
import Redis from 'redis';
import { promisify } from 'util';

export default class RedisKeyValueCache implements KeyValueCache {
  readonly client;
  readonly defaultSetOptions = {
    ttl: 300,
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
    options?: { ttl?: number },
  ): Promise<void> {
    const { ttl } = Object.assign({}, this.defaultSetOptions, options);
    await this.client.set(key, data, 'EX', ttl);
  }

  async get(key: string): Promise<string | undefined> {
    const reply = await this.client.get(key);
    // reply is null if key is not found
    if (reply !== null) {
      return reply;
    }
    return;
  }

  async flush(): Promise<void> {
    await this.client.flushdb();
  }

  async close(): Promise<void> {
    await this.client.quit();
    return;
  }
}
