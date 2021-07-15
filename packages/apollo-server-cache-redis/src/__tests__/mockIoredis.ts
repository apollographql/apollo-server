class Redis {
  private keyValue = new Map<
    string,
    { value: string; ttl: number | undefined }
  >();
  private timeouts = new Set<NodeJS.Timer>();

  async del(key: string) {
    const keysDeleted = this.keyValue.has(key) ? 1 : 0;
    this.keyValue.delete(key);
    return keysDeleted;
  }

  async get(key: string) {
    return this.keyValue.get(key)?.value;
  }

  async mget(...keys: string[]) {
    return keys.map((key) => this.keyValue.get(key)?.value);
  }

  async set(key: string, value: string, _: string, ttl: number | undefined) {
    this.keyValue.set(key, {
      value,
      ttl,
    });
    if (ttl) {
      const timeout = setTimeout(() => {
        this.timeouts.delete(timeout);
        this.del(key);
      }, ttl * 1000);
      this.timeouts.add(timeout);
    }
    return true;
  }

  nodes() {
    return [];
  }

  async flushdb() {}

  async quit() {
    this.timeouts.forEach((t) => clearTimeout(t));
  }
}

// Use the same mock as Redis.Cluster.
(Redis as any).Cluster = Redis;

export default Redis;
