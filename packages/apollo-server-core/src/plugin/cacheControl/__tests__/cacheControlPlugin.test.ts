import { GraphQLError } from 'graphql';
import { Headers } from 'apollo-server-env';
import {
  CacheHint,
  CacheScope,
  GraphQLRequestContext,
} from 'apollo-server-types';
import {
  ApolloServerPluginCacheControl,
  ApolloServerPluginCacheControlOptions,
  PolicyUpdater,
} from '../';
import {
  GraphQLRequestContextWillSendResponse,
  GraphQLResponse,
} from 'apollo-server-plugin-base';
import pluginTestHarness from '../../../utils/pluginTestHarness';

describe('plugin', () => {
  describe('willSendResponse', () => {
    function makePluginWithOptions(
      {
        pluginInitializationOptions,
        overallCachePolicy,
        errors = false,
      }: {
        pluginInitializationOptions?: ApolloServerPluginCacheControlOptions;
        overallCachePolicy?: Required<CacheHint>;
        errors?: boolean;
      } = Object.create(null),
    ) {
      const pluginInstance = ApolloServerPluginCacheControl(
        pluginInitializationOptions,
      );

      return pluginTestHarness({
        pluginInstance,
        overallCachePolicy,
        // This query needs to pass graphql validation
        graphqlRequest: { query: 'query { hello }' },
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

  describe('PolicyUpdater', () => {
    let hints: PolicyUpdater;
    let requestContext: Pick<GraphQLRequestContext, 'overallCachePolicy'>;
    beforeEach(() => {
      requestContext = {};
      hints = new PolicyUpdater(requestContext);
    });

    it('returns undefined without cache hints', () => {
      expect(requestContext.overallCachePolicy).toBeUndefined();
    });

    it('returns lowest max age value', () => {
      hints.addHint({ maxAge: 10 });
      hints.addHint({ maxAge: 20 });

      expect(requestContext.overallCachePolicy).toHaveProperty('maxAge', 10);
    });

    it('returns undefined if any cache hint has a maxAge of 0', () => {
      hints.addHint({ maxAge: 120 });
      hints.addHint({ maxAge: 0 });
      hints.addHint({ maxAge: 20 });

      expect(requestContext.overallCachePolicy).toBeUndefined();
    });

    it('returns undefined if first cache hint has a maxAge of 0', () => {
      hints.addHint({ maxAge: 0 });
      hints.addHint({ maxAge: 20 });

      expect(requestContext.overallCachePolicy).toBeUndefined();
    });

    it('returns PUBLIC scope by default', () => {
      hints.addHint({ maxAge: 10 });

      expect(requestContext.overallCachePolicy).toHaveProperty(
        'scope',
        CacheScope.Public,
      );
    });

    it('returns PRIVATE scope if any cache hint has PRIVATE scope', () => {
      hints.addHint({
        maxAge: 10,
        scope: CacheScope.Public,
      });
      hints.addHint({
        maxAge: 10,
        scope: CacheScope.Private,
      });

      expect(requestContext.overallCachePolicy).toHaveProperty(
        'scope',
        CacheScope.Private,
      );
    });
  });
});
