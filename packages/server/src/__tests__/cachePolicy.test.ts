import type { CachePolicy } from '@apollo/cache-control-types';
import { newCachePolicy } from '../cachePolicy.js';
import { describe, it, expect, beforeEach } from '@jest/globals';

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
    cachePolicy.restrict({ scope: 'PRIVATE' });
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
      scope: 'PUBLIC',
    });
    cachePolicy.restrict({
      maxAge: 10,
      scope: 'PRIVATE',
    });

    expect(cachePolicy).toHaveProperty('scope', 'PRIVATE');
  });

  it('policyIfCacheable', () => {
    expect(cachePolicy.policyIfCacheable()).toBeNull();

    cachePolicy.restrict({ scope: 'PRIVATE' });
    expect(cachePolicy.scope).toBe('PRIVATE');
    expect(cachePolicy.policyIfCacheable()).toBeNull();

    cachePolicy.restrict({ maxAge: 10 });
    expect(cachePolicy).toMatchObject({
      maxAge: 10,
      scope: 'PRIVATE',
    });
    expect(cachePolicy.policyIfCacheable()).toStrictEqual({
      maxAge: 10,
      scope: 'PRIVATE',
    });

    cachePolicy.restrict({ maxAge: 0 });
    expect(cachePolicy).toMatchObject({
      maxAge: 0,
      scope: 'PRIVATE',
    });
    expect(cachePolicy.policyIfCacheable()).toBeNull();
  });

  it('replace', () => {
    cachePolicy.restrict({ maxAge: 10, scope: 'PRIVATE' });
    cachePolicy.replace({ maxAge: 20, scope: 'PUBLIC' });

    expect(cachePolicy).toMatchObject({
      maxAge: 20,
      scope: 'PUBLIC',
    });
  });
});
