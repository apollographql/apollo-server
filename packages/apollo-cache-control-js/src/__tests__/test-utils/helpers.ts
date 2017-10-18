import {
  GraphQLSchema,
  graphql
} from 'graphql';

import { enableGraphQLExtensions } from 'graphql-extensions';
import { CacheControlExtension, CacheControlFormat } from '../..';

export async function collectCacheControlData(schema: GraphQLSchema, source: string): Promise<CacheControlFormat> {
  enableGraphQLExtensions(schema);

  const cacheControlExtension = new CacheControlExtension();

  const response = await graphql({
    schema,
    source,
    contextValue: {
      __extensions: [cacheControlExtension]
    }
  });

  expect(response.errors).toBeUndefined();

  return cacheControlExtension.formatData();
}
