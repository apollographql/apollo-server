// use mock implementations for underlying databases
jest.mock('redis', () => require('redis-mock'));
jest.useFakeTimers(); // mocks out setTimeout that is used in redis-mock

import { RedisCache } from '../index';
import {
  testKeyValueCache_Basics,
  testKeyValueCache_Expiration,
} from '../../../apollo-server-caching/src/__tests__/testsuite';

describe('Redis', () => {
  const cache = new RedisCache({ host: 'localhost' });
  testKeyValueCache_Basics(cache);
  testKeyValueCache_Expiration(cache);
});
