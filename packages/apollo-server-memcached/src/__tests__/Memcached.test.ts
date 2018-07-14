// use mock implementations for underlying databases
jest.mock('memcached', () => require('memcached-mock'));

import { MemcachedCache } from '../index';
import { testKeyValueCache } from '../../../apollo-server-caching/src/__tests__/testsuite';

testKeyValueCache(new MemcachedCache('localhost'));
