import { GraphQLSchema, graphql } from 'graphql';
import {
  CacheHint,
  CacheControlExtensionOptions,
  plugin,
} from '../';
import pluginTestHarness from 'apollo-server-core/dist/utils/pluginTestHarness';

export async function collectCacheControlHints(
  schema: GraphQLSchema,
  source: string,
  options?: CacheControlExtensionOptions,
): Promise<Map<string, CacheHint>> {

  const pluginInstance = plugin(options);

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
    }
  });

  expect(requestContext.response.errors).toBeUndefined();

  return requestContext.cacheHints!;
}
