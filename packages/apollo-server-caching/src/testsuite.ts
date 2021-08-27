import type { KeyValueCache } from './KeyValueCache';

/**
 * runKeyValueCacheTests is a function you can call from a test that exercises
 * the given KeyValueCache. It throws on failure. If you want to test
 * expiration, then mock out `Date` and `setTimeout` (probably with
 * `@sinonjs/fake-timers`) and pass a `tick` that can be called to advance the
 * fake time. (If you don't pass `tick`, it won't test expiration.) Other than
 * that, it has no dependencies and can work in any test system and shouldn't
 * require any particular build configuration to use from jest. See the
 * README.md for an example of how to use this with jest.
 */
export async function runKeyValueCacheTests(
  keyValueCache: KeyValueCache,
  tick?: (ms: number) => void,
) {
  // can do a basic get and set
  await keyValueCache.set('hello', 'world');
  assertEqual(await keyValueCache.get('hello'), 'world');
  assertEqual(await keyValueCache.get('missing'), undefined);

  // can do a basic set and delete
  await keyValueCache.set('hello2', 'world');
  assertEqual(await keyValueCache.get('hello2'), 'world');
  await keyValueCache.delete('hello2');
  assertEqual(await keyValueCache.get('hello2'), undefined);

  if (tick) {
    // is able to expire keys based on ttl
    await keyValueCache.set('short', 's', { ttl: 1 });
    await keyValueCache.set('long', 'l', { ttl: 5 });
    assertEqual(await keyValueCache.get('short'), 's');
    assertEqual(await keyValueCache.get('long'), 'l');
    tick(1500);
    assertEqual(await keyValueCache.get('short'), undefined);
    assertEqual(await keyValueCache.get('long'), 'l');
    tick(4000);
    assertEqual(await keyValueCache.get('short'), undefined);
    assertEqual(await keyValueCache.get('long'), undefined);

    // does not expire when ttl is null
    await keyValueCache.set('forever', 'yours', { ttl: null });
    assertEqual(await keyValueCache.get('forever'), 'yours');
    tick(1500);
    assertEqual(await keyValueCache.get('forever'), 'yours');
    tick(4000);
    assertEqual(await keyValueCache.get('forever'), 'yours');
  }
}

function assertEqual<T>(actual: T, expected: T) {
  if (actual === expected) {
    return;
  }
  throw Error(`Expected ${actual} to equal ${expected}`);
}
