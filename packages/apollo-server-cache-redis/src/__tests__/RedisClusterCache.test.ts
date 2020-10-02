jest.mock('ioredis');

import { Cluster } from 'ioredis';
import { RedisClusterCache } from '../index';
import { testKeyValueCache } from '../../../apollo-server-caching/src/__tests__/testsuite';

testKeyValueCache(new RedisClusterCache([{ host: 'localhost' }]));
testKeyValueCache(new RedisClusterCache(new Cluster([{ host: 'localhost' }])));
