import Redis, {
  ClusterOptions,
  ClusterNode,
  Redis as RedisInstance,
} from 'ioredis';
import { BaseRedisCache } from './BaseRedisCache';

export class RedisClusterCache extends BaseRedisCache {
  private readonly clusterClient: Redis.Cluster;

  constructor(nodes: ClusterNode[], options?: ClusterOptions) {
    const clusterClient = new Redis.Cluster(nodes, options)
    super({
      del: clusterClient.del.bind(clusterClient),
      flushdb: clusterClient.flushdb.bind(clusterClient),
      mget(...keys: Array<string>): Promise<Array<string | null>> {
        return Promise.all(keys.map(key => clusterClient.get(key).catch(() => null)))
      },
      quit: clusterClient.quit.bind(clusterClient),
      set: clusterClient.set.bind(clusterClient),
    });
    this.clusterClient = clusterClient;
  }

  async flush(): Promise<void> {
    const masters = this.clusterClient.nodes('master') || [];
    await Promise.all(masters.map((node: RedisInstance) => node.flushdb()));
  }
}
