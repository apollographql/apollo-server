import { KeyValueCache } from 'apollo-server-caching';
import Memcached from 'memcached';
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
export class MemcachedCache implements KeyValueCache {
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

    // get current versions for all tags
    let tagVersions = {};
    if (tags.length > 0) {
      tagVersions = await this.client.getMulti(tags);

      // initialize tag versions that don't exist yet
      const setOperations: any[] = [];
      for (const tag of tags) {
        if (!tagVersions[tag]) {
          tagVersions[tag] = 1;
          setOperations.push([tag, 1, 0]);
        }
      }
      // wait for all tag versions to initialize
      await Promise.all(setOperations.map(op => this.client.set(...op)));
    }

    const payload = {
      d: data,
      t: tagVersions,
    };

    await this.client.set(key, JSON.stringify(payload), ttl);
  }

  async get(key: string): Promise<string | undefined> {
    const data = await this.client.get(key);
    if (!data) return;

    // deserialize data
    const payload = JSON.parse(data);

    // compare tag versions if cache entry against current versions
    const tagVersions = payload.t;

    if (Object.keys(tagVersions).length !== 0) {
      const currentTagVersions = await this.client.getMulti(
        Object.keys(tagVersions),
      );
      for (const tag in currentTagVersions) {
        if (tagVersions[tag] != currentTagVersions[tag]) {
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
      const incrOperations: any[] = [];
      for (const tag of tags) {
        incrOperations.push([tag, 1]);
      }
      // Note: incr operation simply returns false when key is not present
      // No need to increment those tag:versions since nothing depends on that
      // tag yet.
      await Promise.all(incrOperations.map(op => this.client.incr(...op)));
    }
  }

  async flush(): Promise<void> {
    await this.client.flush();
  }

  async close(): Promise<void> {
    this.client.end();
  }
}
