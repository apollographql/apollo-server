import Redis, {
  ClusterOptions,
  ClusterNode,
  Redis as RedisInstance,
} from 'ioredis';
import { BaseRedisCache } from './BaseRedisCache';

export class RedisClusterCache extends BaseRedisCache {
  readonly client: any;

  constructor(nodes: ClusterNode[], options?: ClusterOptions) {
    super(new Redis.Cluster(nodes, options));
  }

  async flush(): Promise<void> {
    const masters = this.client.nodes('master') || [];
    await Promise.all(masters.map((node: RedisInstance) => node.flushdb()));
  }
}
