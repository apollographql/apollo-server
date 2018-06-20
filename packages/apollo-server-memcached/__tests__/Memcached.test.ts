// use mock implementations for underlying databases
jest.mock('memcached', () => require('memcached-mock'));

import { MemcachedCache } from '../src/index';
import { testKeyValueCache } from 'apollo-server-caching';

testKeyValueCache(new MemcachedCache('localhost'));
