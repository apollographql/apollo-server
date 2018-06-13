import { KeyValueCache } from '../keyValueCache';
import Redis from 'redis';

export default class RedisKeyValueCache implements KeyValueCache {
  private client;
  private defaultSetOptions = {
    ttl: 300,
    tags: [],
  };

  constructor(options: Redis.ClientOpts) {
    this.client = Redis.createClient(options);
  }

  set(
    key: string,
    data: string,
    options?: { ttl?: number; tags?: string[] },
  ): Promise<void> {
    const { ttl } = Object.assign({}, this.defaultSetOptions, options);
    return new Promise<void>((resolve, reject) => {
      this.client.set(key, data, 'EX', ttl, error => {
        error ? reject(error) : resolve();
      });
    });
  }

  get(key: string): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        // reply is null if key is not found
        err ? reject(err) : resolve(reply === null ? undefined : reply);
      });
    });
  }

  flush(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.flushdb(err => {
        err ? reject(err) : resolve();
      });
    });
  }

  close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.quit(err => {
        err ? reject(err) : resolve();
      });
    });
  }

  toString() {
    return 'Redis Connector';
  }
}
