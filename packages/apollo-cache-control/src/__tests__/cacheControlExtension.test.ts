import { ResponsePath, GraphQLError } from 'graphql';
import { GraphQLResponse } from 'graphql-extensions';
import { Headers } from 'apollo-server-env';
import { CacheControlExtension, CacheScope } from '../';

describe('CacheControlExtension', () => {
  let cacheControlExtension: CacheControlExtension;

  beforeEach(() => {
    cacheControlExtension = new CacheControlExtension();
  });

  describe('willSendResponse', () => {
    let graphqlResponse: GraphQLResponse;

    beforeEach(() => {
      cacheControlExtension.options.calculateHttpHeaders = true;
      cacheControlExtension.computeOverallCachePolicy = () => ({
        maxAge: 300,
        scope: CacheScope.Public,
      });
      graphqlResponse = {
        http: {
          headers: new Headers(),
        },
        data: { test: 'test' },
      };
      jest.spyOn(graphqlResponse.http!.headers, 'set');
    });

    it('sets cache-control header', () => {
      cacheControlExtension.willSendResponse &&
        cacheControlExtension.willSendResponse({ graphqlResponse });
      expect(graphqlResponse.http!.headers.set).toHaveBeenCalled();
    });

    it('does not set cache-control header if graphqlResponse has errors', () => {
      graphqlResponse.errors = [new GraphQLError('Test Error')];
      cacheControlExtension.willSendResponse &&
        cacheControlExtension.willSendResponse({ graphqlResponse });
      expect(graphqlResponse.http!.headers.set).not.toHaveBeenCalled();
    });

    it('does not set cache-control header if there is no data', () => {
      graphqlResponse.data = undefined;
      cacheControlExtension.willSendResponse &&
        cacheControlExtension.willSendResponse({ graphqlResponse });
      expect(graphqlResponse.http!.headers.set).not.toHaveBeenCalled();
    });

    it('does not set cache-control header if there is no overall cache policy', () => {
      cacheControlExtension.computeOverallCachePolicy = () => undefined;
      cacheControlExtension.willSendResponse &&
        cacheControlExtension.willSendResponse({ graphqlResponse });
      expect(graphqlResponse.http!.headers.set).not.toHaveBeenCalled();
    });

    it('does not set cache-control header if the overall cache policy has max-age set to 0', () => {
      cacheControlExtension.computeOverallCachePolicy = () => ({
        maxAge: 0,
        scope: CacheScope.Public,
      });
      cacheControlExtension.willSendResponse &&
        cacheControlExtension.willSendResponse({ graphqlResponse });
      expect(graphqlResponse.http!.headers.set).not.toHaveBeenCalled();
    });
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
