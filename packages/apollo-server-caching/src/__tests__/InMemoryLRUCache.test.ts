import {
  testKeyValueCache_Basics,
  testKeyValueCache_Expiration,
} from '../../../apollo-server-caching/src/__tests__/testsuite';
import { InMemoryLRUCache } from '../InMemoryLRUCache';

describe('InMemoryLRUCache', () => {
  const cache = new InMemoryLRUCache();
  testKeyValueCache_Basics(cache);
  testKeyValueCache_Expiration(cache);
});
