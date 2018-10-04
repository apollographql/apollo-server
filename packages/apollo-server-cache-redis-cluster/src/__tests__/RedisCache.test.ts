jest.mock('ioredis');

import { RedisCache } from '../index';
import { testKeyValueCache } from '../../../apollo-server-caching/src/__tests__/testsuite';

testKeyValueCache(new RedisCache({ host: 'localhost' }));
