import { KeyValueCache } from 'apollo-server-caching';
import Redis, {
  ClusterOptions,
  ClusterNode,
  Redis as RedisInstance,
} from 'ioredis';
import DataLoader from 'dataloader';

export class RedisClusterCache implements KeyValueCache {
  readonly client: any;
  readonly defaultSetOptions = {
    ttl: 300,
  };

  private loader: DataLoader<string, string>;

  constructor(nodes: ClusterNode[], options?: ClusterOptions) {
    this.client = new Redis.Cluster(nodes, options);

    this.loader = new DataLoader(
      (keys = []) =>
        Promise.all(keys.map(key => this.client.get(key).catch(() => null))),
      { cache: false },
    );
  }

  async set(
    key: string,
    data: string,
    options?: { ttl?: number },
  ): Promise<void> {
    const { ttl } = Object.assign({}, this.defaultSetOptions, options);
    await this.client.set(key, data, 'EX', ttl);
  }

  async get(key: string): Promise<string | undefined> {
    const reply = await this.loader.load(key);
    // reply is null if key is not found
    if (reply !== null) {
      return reply;
    }
    return;
  }

  async delete(key: string): Promise<boolean> {
    return await this.client.del(key);
  }

  async flush(): Promise<void> {
    const masters = this.client.nodes('master') || [];
    await Promise.all(masters.map((node: RedisInstance) => node.flushdb()));
  }

  async close(): Promise<void> {
    await this.client.quit();
    return;
  }
}
