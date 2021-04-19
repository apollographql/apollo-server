import LRUCache from "lru-cache";

// FIXME rename this file
export class TracesSeenMap {
  readonly traceCaches: Map<number, LRUCache<string, Boolean>> = new Map();
  readonly maxTraceCaches: number = 3;

  seen(endTime: number, cacheKey: string): Boolean {
    return (this.traceCaches.get(endTime)?.get(cacheKey)) || false;
  }

  // FIXME actually call me
  add(endTime: number, cacheKey: string) {
    const traceCache = this.traceCaches.get(endTime);
    if (traceCache) {
      traceCache.set(cacheKey, true);
      return;
    }

    // If we already have max trace caches then drop the oldest one if the new
    // trace will be in a more recent bucket.
    const minEndTime = Math.min(...this.traceCaches.keys());
    if (endTime > minEndTime && this.traceCaches.size >= this.maxTraceCaches) {
      this.traceCaches.delete(minEndTime);
    }

    if (this.traceCaches.size < this.maxTraceCaches) {
      const newTraceCache = new LRUCache<string, Boolean>({
        // 3MiB limit, very much approximately since we can't be sure how V8 might
        // be storing these strings internally. Though this should be enough to
        // store a fair amount of trace keys.

        // A future version of this might expose some
        // configuration option to grow the cache, but ideally, we could do that
        // dynamically based on the resources available to the server, and not add
        // more configuration surface area. Hopefully the warning message will allow
        // us to evaluate the need with more validated input from those that receive
        // it.
        max: Math.pow(2, 20),
        length: (_val, key) => {
          return (key && Buffer.byteLength(key, 'uft8')) || 0;
        },
      });
      this.traceCaches.set(endTime, newTraceCache);
      newTraceCache.set(cacheKey, true);
    }
  }
}

