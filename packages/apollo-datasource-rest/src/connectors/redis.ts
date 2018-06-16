import { KeyValueCache } from '../KeyValueCache';
import Redis from 'redis';
import { promisify } from 'util';

const VERSION_KEY = 'apollo-server-cache:version';

export default class RedisKeyValueCache implements KeyValueCache {
  readonly client;
  readonly defaultSetOptions = {
    ttl: 300,
    tags: [],
  };

  constructor(options: Redis.ClientOpts) {
    this.client = Redis.createClient(options);
    // promisify client calls for convenience
    this.client.get = promisify(this.client.get).bind(this.client);
    this.client.mget = promisify(this.client.mget).bind(this.client);
    this.client.incr = promisify(this.client.incr).bind(this.client);
    this.client.set = promisify(this.client.set).bind(this.client);
    this.client.flushdb = promisify(this.client.flushdb).bind(this.client);
    this.client.quit = promisify(this.client.quit).bind(this.client);
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
      await this.client.set(VERSION_KEY, version + 1);
    } else {
      await this.client.incr(VERSION_KEY);
    }

    // augment data with tags and version
    const payload = {
      v: version,
      d: data,
      t: tags,
    };

    await this.client.set(key, JSON.stringify(payload), 'EX', ttl);
  }

  async get(key: string): Promise<string | undefined> {
    const data = await this.client.get(key);
    // reply is null if key is not found
    if (data === null) {
      return;
    }

    // deserialize data
    const payload = JSON.parse(data);
    // check "timestamp" at which tags have been invalidated
    const tags = payload.t;

    if (tags.length !== 0) {
      const versions = await this.client.mget(tags);
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
      await this.client.set(VERSION_KEY, version + 1);
    } else {
      await this.client.incr(VERSION_KEY);
    }

    const operations: any[] = [];
    for (const tag of tags) {
      operations.push([tag, version]); // tags should not be set to expire
    }
    // wait for all operations to finish
    await Promise.all(operations.map(op => this.client.set(...op)));
  }

  async flush(): Promise<void> {
    await this.client.flushdb();
  }

  async close(): Promise<void> {
    await this.client.quit();
    return;
  }
}
