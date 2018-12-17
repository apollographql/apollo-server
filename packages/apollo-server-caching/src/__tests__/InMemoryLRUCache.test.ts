import { testKeyValueCache_Basics } from '../../../apollo-server-caching/src/__tests__/testsuite';
import { InMemoryLRUCache } from '../InMemoryLRUCache';

describe('InMemoryLRUCache', () => {
  const cache = new InMemoryLRUCache();
  testKeyValueCache_Basics(cache);
});
