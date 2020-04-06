import { ResponsePath, GraphQLError } from 'graphql';
import { Headers } from 'apollo-server-env';
import {
  CacheScope,
  CacheControlExtensionOptions,
  CacheHint,
  __testing__,
  plugin,
} from '../';
const { addHint, computeOverallCachePolicy } = __testing__;
import {
  GraphQLRequestContextWillSendResponse,
  GraphQLResponse,
} from 'apollo-server-plugin-base';
import pluginTestHarness from 'apollo-server-core/dist/utils/pluginTestHarness';

describe('plugin', () => {
  describe('willSendResponse', () => {
    function makePluginWithOptions({
      pluginInitializationOptions,
      overallCachePolicy,
      errors = false,
    }: {
      pluginInitializationOptions?: CacheControlExtensionOptions;
      overallCachePolicy?: Required<CacheHint>;
      errors?: boolean;
    } = Object.create(null)) {
      const pluginInstance = plugin(pluginInitializationOptions);

      return pluginTestHarness({
        pluginInstance,
        overallCachePolicy,
        graphqlRequest: { query: 'does not matter' },
        executor: () => {
          const response: GraphQLResponse = {
            http: {
              headers: new Headers(),
            },
            data: { test: 'test' },
          };

          if (errors) {
            response.errors = [new GraphQLError('Test Error')];
          }

          return response;
        },
      });
    }

    describe('HTTP cache-control header', () => {
      const overallCachePolicy: Required<CacheHint> = {
        maxAge: 300,
        scope: CacheScope.Public,
      };

      it('is set when calculateHttpHeaders is set to true', async () => {
        const requestContext = await makePluginWithOptions({
          pluginInitializationOptions: {
            calculateHttpHeaders: true,
          },
          overallCachePolicy,
        });
        expect(requestContext.response.http!.headers.get('Cache-Control')).toBe(
          'max-age=300, public',
        );
      });

      const shouldNotSetCacheControlHeader = (
        requestContext: GraphQLRequestContextWillSendResponse<any>,
      ) => {
        expect(
          requestContext.response.http!.headers.get('Cache-Control'),
        ).toBeNull();
      };

      it('is not set when calculateHttpHeaders is set to false', async () => {
        const requestContext = await makePluginWithOptions({
          pluginInitializationOptions: {
            calculateHttpHeaders: false,
          },
          overallCachePolicy,
        });
        shouldNotSetCacheControlHeader(requestContext);
      });

      it('is not set if response has errors', async () => {
        const requestContext = await makePluginWithOptions({
          pluginInitializationOptions: {
            calculateHttpHeaders: false,
          },
          overallCachePolicy,
          errors: true,
        });
        shouldNotSetCacheControlHeader(requestContext);
      });

      it('does not set cache-control header if there is no overall cache policy', async () => {
        const requestContext = await makePluginWithOptions({
          pluginInitializationOptions: {
            calculateHttpHeaders: false,
          },
          overallCachePolicy: undefined,
          errors: true,
        });
        shouldNotSetCacheControlHeader(requestContext);
      });
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

    const hints = new Map();
    afterEach(() => hints.clear());

    it('returns undefined without cache hints', () => {
      const cachePolicy = computeOverallCachePolicy(hints);
      expect(cachePolicy).toBeUndefined();
    });

    it('returns lowest max age value', () => {
      addHint(hints, responsePath, { maxAge: 10 });
      addHint(hints, responseSubPath, { maxAge: 20 });

      const cachePolicy = computeOverallCachePolicy(hints);
      expect(cachePolicy).toHaveProperty('maxAge', 10);
    });

    it('returns undefined if any cache hint has a maxAge of 0', () => {
      addHint(hints, responsePath, { maxAge: 120 });
      addHint(hints, responseSubPath, { maxAge: 0 });
      addHint(hints, responseSubSubPath, { maxAge: 20 });

      const cachePolicy = computeOverallCachePolicy(hints);
      expect(cachePolicy).toBeUndefined();
    });

    it('returns PUBLIC scope by default', () => {
      addHint(hints, responsePath, { maxAge: 10 });

      const cachePolicy = computeOverallCachePolicy(hints);
      expect(cachePolicy).toHaveProperty('scope', CacheScope.Public);
    });

    it('returns PRIVATE scope if any cache hint has PRIVATE scope', () => {
      addHint(hints, responsePath, {
        maxAge: 10,
        scope: CacheScope.Public,
      });
      addHint(hints, responseSubPath, {
        maxAge: 10,
        scope: CacheScope.Private,
      });

      const cachePolicy = computeOverallCachePolicy(hints);
      expect(cachePolicy).toHaveProperty('scope', CacheScope.Private);
    });
  });
});
