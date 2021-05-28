import { CachePolicy, CacheScope } from 'apollo-server-types';
import { newCachePolicy } from '../cachePolicy';

describe('newCachePolicy', () => {
  let cachePolicy: CachePolicy;
  beforeEach(() => {
    cachePolicy = newCachePolicy();
  });

  it('starts uncacheable', () => {
    expect(cachePolicy.maxAge).toBeUndefined();
    expect(cachePolicy.scope).toBeUndefined();
  });

  it('restricting maxAge positive makes restricted', () => {
    cachePolicy.restrict({ maxAge: 10 });
  });

  it('restricting maxAge 0 makes restricted', () => {
    cachePolicy.restrict({ maxAge: 0 });
  });

  it('restricting scope to private makes restricted', () => {
    cachePolicy.restrict({ scope: CacheScope.Private });
  });

  it('returns lowest max age value', () => {
    cachePolicy.restrict({ maxAge: 10 });
    cachePolicy.restrict({ maxAge: 20 });

    expect(cachePolicy.maxAge).toBe(10);
  });

  it('returns lowest max age value in other order', () => {
    cachePolicy.restrict({ maxAge: 20 });
    cachePolicy.restrict({ maxAge: 10 });

    expect(cachePolicy.maxAge).toBe(10);
  });

  it('maxAge 0 if any cache hint has a maxAge of 0', () => {
    cachePolicy.restrict({ maxAge: 120 });
    cachePolicy.restrict({ maxAge: 0 });
    cachePolicy.restrict({ maxAge: 20 });

    expect(cachePolicy.maxAge).toBe(0);
  });

  it('returns undefined if first cache hint has a maxAge of 0', () => {
    cachePolicy.restrict({ maxAge: 0 });
    cachePolicy.restrict({ maxAge: 20 });

    expect(cachePolicy.maxAge).toBe(0);
  });

  it('only restricting maxAge keeps scope undefined', () => {
    cachePolicy.restrict({ maxAge: 10 });

    expect(cachePolicy.scope).toBeUndefined();
  });

  it('returns PRIVATE scope if any cache hint has PRIVATE scope', () => {
    cachePolicy.restrict({
      maxAge: 10,
      scope: CacheScope.Public,
    });
    cachePolicy.restrict({
      maxAge: 10,
      scope: CacheScope.Private,
    });

    expect(cachePolicy).toHaveProperty('scope', CacheScope.Private);
  });

  it('policyIfCacheable', () => {
    expect(cachePolicy.policyIfCacheable()).toBeNull();

    cachePolicy.restrict({ scope: CacheScope.Private });
    expect(cachePolicy.scope).toBe(CacheScope.Private);
    expect(cachePolicy.policyIfCacheable()).toBeNull();

    cachePolicy.restrict({ maxAge: 10 });
    expect(cachePolicy).toMatchObject({
      maxAge: 10,
      scope: CacheScope.Private,
    });
    expect(cachePolicy.policyIfCacheable()).toStrictEqual({
      maxAge: 10,
      scope: CacheScope.Private,
    });

    cachePolicy.restrict({ maxAge: 0 });
    expect(cachePolicy).toMatchObject({
      maxAge: 0,
      scope: CacheScope.Private,
    });
    expect(cachePolicy.policyIfCacheable()).toBeNull();
  });

  it('replace', () => {
    cachePolicy.restrict({ maxAge: 10, scope: CacheScope.Private });
    cachePolicy.replace({ maxAge: 20, scope: CacheScope.Public });

    expect(cachePolicy).toMatchObject({
      maxAge: 20,
      scope: CacheScope.Public,
    });
  });
});
