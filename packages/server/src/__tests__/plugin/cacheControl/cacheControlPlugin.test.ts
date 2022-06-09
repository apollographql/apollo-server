import { GraphQLError } from 'graphql';
import {
  ApolloServerPluginCacheControl,
  type ApolloServerPluginCacheControlOptions,
} from '../../../plugin/cacheControl';
import { ApolloServer, CacheHint, HTTPGraphQLResponse } from '../../..';

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
            headers: new Map([['apollo-require-preflight', 't']]),
            searchParams: { query: '{hello}' },
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
