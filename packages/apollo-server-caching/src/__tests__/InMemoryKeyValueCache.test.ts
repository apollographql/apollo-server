import { testKeyValueCache } from '../tests';
import { InMemoryKeyValueCache } from '../InMemoryKeyValueCache';
testKeyValueCache(new InMemoryKeyValueCache());
