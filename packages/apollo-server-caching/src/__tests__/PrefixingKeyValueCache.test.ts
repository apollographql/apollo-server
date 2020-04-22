import { InMemoryLRUCache } from '../InMemoryLRUCache';
import { PrefixingKeyValueCache } from '../PrefixingKeyValueCache';

describe('PrefixingKeyValueCache', () => {
  it('prefixes', async () => {
    const inner = new InMemoryLRUCache();
    const prefixing = new PrefixingKeyValueCache(inner, 'prefix:');
    await prefixing.set('foo', 'bar');
    expect(await prefixing.get('foo')).toBe('bar');
    expect(await inner.get('prefix:foo')).toBe('bar');
    await prefixing.delete('foo');
    expect(await prefixing.get('foo')).toBe(undefined);
  });
});
