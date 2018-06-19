import { KeyValueCache } from 'apollo-server-caching';
import Redis from 'redis';
import { promisify } from 'util';

/**
 * Defines a KeyValueCache implementation that supports cache tag invalidation.
 * When cache entry is associated with 1 or more tags, we store tag:version
 * pairs as metadata, as well as the current version associated with each tag.
 * Version numbers are simply integers that are incremented whenever a tag is
 * invalidated. For a cache entry to be valid, all of its associated tags must
 * have version numbers that match their current version numbers.
 *
 * Performance:
 * - set()        : # of db reads = # of tags
 * - get()        : # of db reads = # of tags
 * - invalidate() : # of db writes/incr = 1 for each tag
 *
 * Storage overhead:
 * - key->data + tag:version pairs for each tag
 * - tag->version stored for each tag
 */
export class RedisCache implements KeyValueCache {
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
    options?: { ttl?: number },
  ): Promise<void> {
    const { ttl, tags } = Object.assign({}, this.defaultSetOptions, options);

    // get current versions for all tags
    let tagVersions = {} as any;
    if (tags.length > 0) {
      const tagVersionsArr = await this.client.mget(tags);

      const setOperations: any[] = [];
      for (let i = 0; i < tagVersionsArr.length; i++) {
        let version: number;
        if (tagVersionsArr[i] === null) {
          version = 1;
          // tag:version does not exist yet, initialize it
          setOperations.push([tags[i], version]);
        } else {
          version = parseInt(tagVersionsArr[i]);
        }
        tagVersions[tags[i]] = version;
      }

      // wait for all tag versions to initialize
      await Promise.all(setOperations.map(op => this.client.set(...op)));
    }

    const payload = {
      d: data,
      t: tagVersions,
    };

    await this.client.set(key, JSON.stringify(payload), 'EX', ttl);
  }

  async get(key: string): Promise<string | undefined> {
    const data = await this.client.get(key);
    if (data === null) return; // null is returned if key is not found

    // deserialize data
    const payload = JSON.parse(data);

    // compare tag versions of cache entry against current versions
    const tagVersions = payload.t;

    const tags = Object.keys(tagVersions);
    if (tags.length !== 0) {
      const currentTagVersionsArr = await this.client.mget(tags);

      for (let i = 0; i < currentTagVersionsArr.length; i++) {
        if (
          currentTagVersionsArr[i] !== null &&
          parseInt(currentTagVersionsArr[i]) !== tagVersions[tags[i]]
        ) {
          return; // tag has been invalidated, therefore cache entry not valid
        }
      }
    }

    // all tag versions up to date
    return payload.d;
  }

  async invalidate(tags: string[]): Promise<void> {
    // increment version numbers for all the tags to be invalidated
    if (tags.length > 0) {
      const tagsToIncr: any[] = [];
      for (const tag of tags) {
        tagsToIncr.push(tag);
      }
      // Note: in Redis, if key does not exist, it is set to 0 before performing
      // the incr operation.
      await Promise.all(tagsToIncr.map(tag => this.client.incr(tag)));
    }
  }

  async flush(): Promise<void> {
    await this.client.flushdb();
  }

  async close(): Promise<void> {
    await this.client.quit();
    return;
  }
}
