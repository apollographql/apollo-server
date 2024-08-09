import { GraphQLError } from 'graphql';
import {
  ApolloServerPluginCacheControl,
  ApolloServerPluginCacheControlOptions,
} from '../../../plugin/cacheControl';
import { ApolloServer, HTTPGraphQLResponse, HeaderMap } from '../../..';
import type { CacheHint } from '@apollo/cache-control-types';
import { describe, it, expect } from '@jest/globals';

describe('plugin', () => {
  describe('willSendResponse', () => {
    async function makePluginWithOptions(
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
      const server = new ApolloServer({
        typeDefs: 'type Query {hello: String}',
        resolvers: {
          Query: {
            hello() {
              if (errors) {
                throw new GraphQLError('test error');
              }
              return 'asdf';
            },
          },
        },
        plugins: [ApolloServerPluginCacheControl(pluginInitializationOptions)],
      });

      if (overallCachePolicy) {
        server.addPlugin({
          async requestDidStart({
            overallCachePolicy: contextOverallCachePolicy,
          }) {
            contextOverallCachePolicy.replace(overallCachePolicy);
          },
        });
      }

      await server.start();

      try {
        return await server.executeHTTPGraphQLRequest({
          httpGraphQLRequest: {
            method: 'GET',
            headers: new HeaderMap([['apollo-require-preflight', 't']]),
            // cspell:ignore Bhello
            search: 'query=%7Bhello%7D',
            body: {},
          },
          context: async () => ({}),
        });
      } finally {
        await server.stop();
      }
    }

    describe('HTTP cache-control header', () => {
      const overallCachePolicy: Required<CacheHint> = {
        maxAge: 300,
        scope: 'PUBLIC',
      };

      it('is set when calculateHttpHeaders is set to true', async () => {
        const response = await makePluginWithOptions({
          pluginInitializationOptions: {
            calculateHttpHeaders: true,
          },
          overallCachePolicy,
        });
        expect(response.headers.get('cache-control')).toBe(
          'max-age=300, public',
        );
      });

      // start
      it('should set cache-control headers to default max age when provided a defaultMaxAge', async () => {
        const response = await makePluginWithOptions({
          pluginInitializationOptions: {
            calculateHttpHeaders: true,
            defaultMaxAge: 100,
          },
        });
        expect(response.headers.get('cache-control')).toBe(
          'max-age=100, public',
        );
      });

      it('should set cache-control headers to default max age when provided a defaultMaxAge in a human readable format', async () => {
        const response = await makePluginWithOptions({
          pluginInitializationOptions: {
            calculateHttpHeaders: true,
            defaultMaxAge: '1d',
          },
        });
        expect(response.headers.get('cache-control')).toBe(
          'max-age=86400, public',
        );
      });

      it('should not set cache-control headers when provided a defaultMaxAge in a invalid human readable format', async () => {
        const response = await makePluginWithOptions({
          pluginInitializationOptions: {
            calculateHttpHeaders: true,
            defaultMaxAge: '1ddddd',
          },
        });
        expect(response.headers.get('cache-control')).toBe('no-store');
      });
      // end

      const shouldNotSetCacheControlHeader = (
        response: HTTPGraphQLResponse,
      ) => {
        expect(response.headers.get('cache-control')).toBeUndefined();
      };

      it('is not set when calculateHttpHeaders is set to false', async () => {
        const response = await makePluginWithOptions({
          pluginInitializationOptions: {
            calculateHttpHeaders: false,
          },
          overallCachePolicy,
        });
        shouldNotSetCacheControlHeader(response);
      });

      it('is not set if response has errors', async () => {
        const response = await makePluginWithOptions({
          pluginInitializationOptions: {
            calculateHttpHeaders: false,
          },
          overallCachePolicy,
          errors: true,
        });
        shouldNotSetCacheControlHeader(response);
      });

      it('does not set cache-control header if there is no overall cache policy', async () => {
        const response = await makePluginWithOptions({
          pluginInitializationOptions: {
            calculateHttpHeaders: false,
          },
          overallCachePolicy: undefined,
          errors: true,
        });
        shouldNotSetCacheControlHeader(response);
      });
    });
  });
});
