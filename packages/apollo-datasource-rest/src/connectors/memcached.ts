import { KeyValueCache } from '../KeyValueCache';
import Memcached from 'memcached';
import { promisify } from 'util';

// Store a global version number (like a logical clock) in the key value store
const VERSION_KEY = 'apollo-server-cache:version';

export default class MemcachedKeyValueCache implements KeyValueCache {
  readonly client;
  readonly defaultSetOptions = {
    ttl: 300,
    tags: [],
  };

  constructor(serverLocation: Memcached.Location, options?: Memcached.options) {
    this.client = new Memcached(serverLocation, options);
    // promisify client calls for convenience
    this.client.get = promisify(this.client.get).bind(this.client);
    this.client.getMulti = promisify(this.client.getMulti).bind(this.client);
    this.client.incr = promisify(this.client.incr).bind(this.client);
    this.client.set = promisify(this.client.set).bind(this.client);
    this.client.flush = promisify(this.client.flush).bind(this.client);
  }

  async set(
    key: string,
    data: string,
    options?: { ttl?: number; tags?: string[] },
  ): Promise<void> {
    const { ttl, tags } = Object.assign({}, this.defaultSetOptions, options);

    // get and incr version number
    let version = await this.client.get(VERSION_KEY);
    if (!version) {
      // initialize version number
      version = 1;
      await this.client.set(VERSION_KEY, version + 1, 0);
    } else {
      await this.client.incr(VERSION_KEY, 1);
    }

    // augment data with tags and version
    const payload = {
      v: version,
      d: data,
      t: tags,
    };

    await this.client.set(key, JSON.stringify(payload), ttl);
  }

  async get(key: string): Promise<string | undefined> {
    const data = await this.client.get(key);
    if (!data) return;

    // deserialize data
    const payload = JSON.parse(data);

    // check "timestamp" at which tags have been invalidated
    const tags = payload.t;
    if (tags.length !== 0) {
      const versions = await this.client.getMulti(tags);
      for (const tag in versions) {
        if (versions[tag] !== undefined && versions[tag] > payload.v) {
          return; // tag has been invalidated, therefore cache entry not valid
        }
      }
    }

    // all version numbers up to date
    return payload.d;
  }

  async invalidate(tags: string[]): Promise<void> {
    // set the invalidation "timestamp" using logical clock for every tag
    let version = await this.client.get(VERSION_KEY);
    if (!version) {
      // initialize version number
      version = 1;
      await this.client.set(VERSION_KEY, version + 1, 0);
    } else {
      await this.client.incr(VERSION_KEY, 1);
    }

    const operations: any[] = [];
    for (const tag of tags) {
      operations.push([tag, version, 0]); // setting ttl to 0, never expire
    }
    await Promise.all(operations.map(op => this.client.set(...op)));
  }

  async flush(): Promise<void> {
    await this.client.flush();
  }

  async close(): Promise<void> {
    this.client.end();
  }
}
