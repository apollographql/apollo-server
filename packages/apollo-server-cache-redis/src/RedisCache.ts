import Redis, { RedisOptions } from 'ioredis';
import { BaseRedisCache } from './BaseRedisCache';

export class RedisCache extends BaseRedisCache {
  constructor(options?: RedisOptions) {
    super(new Redis(options));
  }
}
