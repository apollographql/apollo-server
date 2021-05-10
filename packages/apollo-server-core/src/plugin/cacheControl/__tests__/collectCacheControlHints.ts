import { GraphQLSchema, graphql } from 'graphql';
import { CacheHint } from 'apollo-server-types';
import {
  ApolloServerPluginCacheControl,
  ApolloServerPluginCacheControlOptions,
} from '../';
import pluginTestHarness from '../../../utils/pluginTestHarness';

export async function collectCacheControlHints(
  schema: GraphQLSchema,
  source: string,
  options: ApolloServerPluginCacheControlOptions = {},
): Promise<Map<string, CacheHint>> {
  const cacheHints = new Map<string, CacheHint>();
  const pluginInstance = ApolloServerPluginCacheControl({
    ...options,
    __testing__cacheHints: cacheHints,
  });

  const requestContext = await pluginTestHarness({
    pluginInstance,
    schema,
    graphqlRequest: {
      query: source,
    },
    executor: async (requestContext) => {
      return await graphql({
        schema,
        source: requestContext.request.query,
        contextValue: requestContext.context,
      });
    },
  });

  expect(requestContext.response.errors).toBeUndefined();

  return cacheHints;
}
