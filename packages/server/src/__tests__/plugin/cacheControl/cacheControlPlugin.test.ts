import { GraphQLError } from 'graphql';
import type { CacheHint } from '../../../externalTypes';
import {
  ApolloServerPluginCacheControl,
  ApolloServerPluginCacheControlOptions,
} from '../../..';
import type {
  GraphQLRequestContextWillSendResponse,
  GraphQLResponse,
} from '../../../externalTypes';
import pluginTestHarness from '../../pluginTestHarness';
import { HeaderMap } from '../../../runHttpQuery';

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
        executor: async () => {
          const response: GraphQLResponse = {
            http: {
              headers: new HeaderMap(),
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
        scope: 'PUBLIC',
      };

      it('is set when calculateHttpHeaders is set to true', async () => {
        const requestContext = await makePluginWithOptions({
          pluginInitializationOptions: {
            calculateHttpHeaders: true,
          },
          overallCachePolicy,
        });
        expect(requestContext.response.http!.headers.get('cache-control')).toBe(
          'max-age=300, public',
        );
      });

      const shouldNotSetCacheControlHeader = (
        requestContext: GraphQLRequestContextWillSendResponse<any>,
      ) => {
        expect(
          requestContext.response.http!.headers.get('cache-control'),
        ).toBeUndefined();
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
});
