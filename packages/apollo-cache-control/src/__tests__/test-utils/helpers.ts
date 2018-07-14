import { GraphQLSchema, graphql } from 'graphql';

import {
  enableGraphQLExtensions,
  GraphQLExtensionStack,
} from 'graphql-extensions';
import {
  CacheControlExtension,
  CacheHint,
  CacheControlExtensionOptions,
} from '../..';

export async function collectCacheControlHints(
  schema: GraphQLSchema,
  source: string,
  options?: CacheControlExtensionOptions,
): Promise<CacheHint[]> {
  enableGraphQLExtensions(schema);

  const cacheControlExtension = new CacheControlExtension(options);

  const response = await graphql({
    schema,
    source,
    contextValue: {
      _extensionStack: new GraphQLExtensionStack([cacheControlExtension]),
    },
  });

  expect(response.errors).toBeUndefined();

  return cacheControlExtension.format()[1].hints;
}
