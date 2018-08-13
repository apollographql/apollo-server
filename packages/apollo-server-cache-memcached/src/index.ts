import { KeyValueCache } from 'apollo-server-caching';
import * as Memcached from 'memcached';
import { promisify } from 'util';

export class MemcachedCache implements KeyValueCache {
  // FIXME: Replace any with proper promisified type
  readonly client: any;
  readonly defaultSetOptions = {
    ttl: 300,
  };

  constructor(serverLocation: Memcached.Location, options?: Memcached.options) {
    const client = new Memcached(serverLocation, options);
    // promisify client calls for convenience
    client.get = promisify(client.get).bind(client);
    client.set = promisify(client.set).bind(client);
    client.flush = promisify(client.flush).bind(client);

    this.client = client;
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
