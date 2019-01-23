import { ResponsePath } from 'graphql';
import { CacheControlExtension, CacheScope } from '../';

describe('CacheControlExtension', () => {
  let cacheControlExtension: CacheControlExtension;

  beforeEach(() => {
    cacheControlExtension = new CacheControlExtension();
  });

  describe('computeOverallCachePolicy', () => {
    const responsePath: ResponsePath = {
      key: 'test',
      prev: undefined,
    };
    const responseSubPath: ResponsePath = {
      key: 'subTest',
      prev: responsePath,
    };
    const responseSubSubPath: ResponsePath = {
      key: 'subSubTest',
      prev: responseSubPath,
    };

    it('returns undefined without cache hints', () => {
      const cachePolicy = cacheControlExtension.computeOverallCachePolicy();
      expect(cachePolicy).toBeUndefined();
    });

    it('returns lowest max age value', () => {
      cacheControlExtension.addHint(responsePath, { maxAge: 10 });
      cacheControlExtension.addHint(responseSubPath, { maxAge: 20 });

      const cachePolicy = cacheControlExtension.computeOverallCachePolicy();
      expect(cachePolicy).toHaveProperty('maxAge', 10);
    });

    it('returns undefined if any cache hint has a maxAge of 0', () => {
      cacheControlExtension.addHint(responsePath, { maxAge: 120 });
      cacheControlExtension.addHint(responseSubPath, { maxAge: 0 });
      cacheControlExtension.addHint(responseSubSubPath, { maxAge: 20 });

      const cachePolicy = cacheControlExtension.computeOverallCachePolicy();
      expect(cachePolicy).toBeUndefined();
    });

    it('returns PUBLIC scope by default', () => {
      cacheControlExtension.addHint(responsePath, { maxAge: 10 });

      const cachePolicy = cacheControlExtension.computeOverallCachePolicy();
      expect(cachePolicy).toHaveProperty('scope', CacheScope.Public);
    });

    it('returns PRIVATE scope if any cache hint has PRIVATE scope', () => {
      cacheControlExtension.addHint(responsePath, {
        maxAge: 10,
        scope: CacheScope.Public,
      });
      cacheControlExtension.addHint(responseSubPath, {
        maxAge: 10,
        scope: CacheScope.Private,
      });

      const cachePolicy = cacheControlExtension.computeOverallCachePolicy();
      expect(cachePolicy).toHaveProperty('scope', CacheScope.Private);
    });
  });
});
