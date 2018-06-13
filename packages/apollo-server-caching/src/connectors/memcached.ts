import { KeyValueCache } from '../keyValueCache';
import Memcached from 'memcached';

export default class MemcachedKeyValueCache implements KeyValueCache {
  private client;
  private defaultSetOptions = {
    ttl: 300,
    tags: [],
  };

  constructor(serverLocation: Memcached.Location, options?: Memcached.options) {
    this.client = new Memcached(serverLocation, options);
  }

  set(
    key: string,
    data: string,
    options?: { ttl?: number; tags?: string[] },
  ): Promise<void> {
    const { ttl } = Object.assign({}, this.defaultSetOptions, options);
    return new Promise<void>((resolve, reject) => {
      this.client.set(key, data, ttl, error => {
        error ? reject(error) : resolve();
      });
    });
  }

  get(key: string): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve, reject) => {
      this.client.get(key, (error, reply) => {
        error ? reject(error) : resolve(reply);
      });
    });
  }

  flush(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.flush(error => {
        error ? reject(error) : resolve();
      });
    });
  }

  close(): Promise<void> {
    this.client.end();
    return Promise.resolve();
  }

  toString() {
    return 'Memcached Connector';
  }
}
