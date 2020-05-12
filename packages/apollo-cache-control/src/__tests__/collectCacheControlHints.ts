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
): Promise<CacheHint[]> {

  // Because this test helper looks at the formatted extensions, we always want
  // to include them in the response rather than allow them to be stripped
  // out.
  const pluginInstance = plugin({
    ...options,
    stripFormattedExtensions: false,
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
    }
  });

  expect(requestContext.response.errors).toBeUndefined();

  return requestContext.response.extensions!.cacheControl.hints;
}
