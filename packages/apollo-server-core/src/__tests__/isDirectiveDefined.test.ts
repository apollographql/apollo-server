import { gql } from '../';
import { isDirectiveDefined } from '../utils/isDirectiveDefined';

describe('isDirectiveDefined', () => {
  const noCacheControl = `
    type Query {
      hello: String
    }
  `;
  const hasCacheControl = `
    type Query {
      hello: String
    }

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }

    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
    ) on FIELD_DEFINITION | OBJECT | INTERFACE
  `;

  describe('When passed a DocumentNode', () => {
    it('returns false when a directive is not defined', () => {
      expect(isDirectiveDefined(gql(noCacheControl), 'cacheControl')).toBe(
        false,
      );
    });
    it('returns true when a directive is defined', () => {
      expect(isDirectiveDefined(gql(hasCacheControl), 'cacheControl')).toBe(
        true,
      );
    });
  });

  describe('When passed an array of DocumentNode', () => {
    it('returns false when a directive is not defined', () => {
      expect(isDirectiveDefined([gql(noCacheControl)], 'cacheControl')).toBe(
        false,
      );
    });
    it('returns true when a directive is defined', () => {
      expect(isDirectiveDefined([gql(hasCacheControl)], 'cacheControl')).toBe(
        true,
      );
    });
  });

  describe('When passed an array of strings', () => {
    it('returns false when a directive is not defined', () => {
      expect(isDirectiveDefined([noCacheControl], 'cacheControl')).toBe(false);
    });
    it('returns true when a directive is defined', () => {
      expect(isDirectiveDefined([hasCacheControl], 'cacheControl')).toBe(true);
    });
  });

  describe('When passed a string', () => {
    it('returns false when a directive is not defined', () => {
      expect(isDirectiveDefined(noCacheControl, 'cacheControl')).toBe(false);
    });
    it('returns true when a directive is defined', () => {
      expect(isDirectiveDefined(hasCacheControl, 'cacheControl')).toBe(true);
    });
  });
});
