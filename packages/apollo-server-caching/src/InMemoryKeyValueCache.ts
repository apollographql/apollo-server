import LRU from 'lru-cache';
import { KeyValueCache } from './KeyValueCache';

export class InMemoryKeyValueCache implements KeyValueCache {
  readonly store: LRU.Cache<string, string>;
  readonly tagVersionStore: Map<string, number>;
  readonly defaultSetOptions = {
    ttl: 300,
    tags: [],
  };

  // FIXME: Define reasonable default max size of the cache
  constructor(maxSize: number = Infinity) {
    this.store = LRU({
      max: maxSize,
      length: item => item.length,
    });
    this.tagVersionStore = new Map<string, number>();
  }

  async set(
    key: string,
    data: string,
    options?: { ttl?: number; tags?: string[] },
  ) {
    const { ttl, tags } = Object.assign({}, this.defaultSetOptions, options);

    const tagVersions = {} as any;

    // get current versions for all tags
    for (const tag of tags) {
      const version = this.tagVersionStore.get(tag);
      if (version) {
        tagVersions[tag] = version;
      } else {
        // initialize tag version
        this.tagVersionStore.set(tag, 1);
        tagVersions[tag] = 1;
      }
    }

    const payload = {
      d: data,
      t: tagVersions,
    };

    // lru-cache receives time in ms
    this.store.set(key, JSON.stringify(payload), ttl * 1000);
  }

  async get(key: string) {
    const data = this.store.get(key);
    if (!data) return;

    // deserialize data
    const payload = JSON.parse(data);

    // compare tag versions if cache entry against current versions
    const tagVersions = payload.t;

    for (const tag in tagVersions) {
      const currentVersion = this.tagVersionStore.get(tag);
      if (currentVersion && currentVersion !== tagVersions[tag]) {
        return;
      }
    }

    // all tag versions up to date
    return payload.d;
  }

  async invalidate(tags: string[]): Promise<void> {
    for (const tag of tags) {
      const currentVersion = this.tagVersionStore.get(tag);
      if (currentVersion) {
        this.tagVersionStore.set(tag, currentVersion + 1);
      }
    }
  }

  async close(): Promise<void> {
    return;
  }

  async flush(): Promise<void> {
    return;
  }
}
