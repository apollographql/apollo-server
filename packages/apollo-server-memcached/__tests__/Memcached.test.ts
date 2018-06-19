// use mock implementations for underlying databases
jest.mock('memcached', () => require('memcached-mock'));

import { MemcachedKeyValueCache } from '../src/index';
import { testKeyValueCache } from 'apollo-server-caching';

testKeyValueCache(new MemcachedKeyValueCache('localhost'));
