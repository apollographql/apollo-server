// use mock implementations for underlying databases
jest.mock('redis', () => require('redis-mock'));
jest.useFakeTimers(); // mocks out setTimeout that is used in redis-mock

import { RedisCache } from '../index';
import { testKeyValueCache } from '../../../apollo-server-caching/src/__tests__/testsuite';

testKeyValueCache(new RedisCache({ host: 'localhost' }));
