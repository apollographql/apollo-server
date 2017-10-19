import {
  GraphQLSchema,
  graphql
} from 'graphql';

import { enableGraphQLExtensions } from 'graphql-extensions';
import { CacheControlExtension, CacheHint } from '../..';

export async function collectCacheControlHints(schema: GraphQLSchema, source: string): Promise<CacheHint[]> {
  enableGraphQLExtensions(schema);

  const cacheControlExtension = new CacheControlExtension();

  const response = await graphql({
    schema,
    source,
    contextValue: {
      _extensions: [cacheControlExtension]
    }
  });

  expect(response.errors).toBeUndefined();

  return cacheControlExtension.format()[1].hints;
}
