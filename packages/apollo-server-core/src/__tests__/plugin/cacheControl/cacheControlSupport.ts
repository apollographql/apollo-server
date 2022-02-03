import { buildSchema } from 'graphql';
import {
  makeExecutableSchema,
  IExecutableSchemaDefinition,
} from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';

export function augmentTypeDefsWithCacheControlSupport(typeDefs: string) {
  return (
    `
  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION
` + typeDefs
  );
}

export function buildSchemaWithCacheControlSupport(source: string) {
  return buildSchema(augmentTypeDefsWithCacheControlSupport(source));
}

export function makeExecutableSchemaWithCacheControlSupport(
  options: IExecutableSchemaDefinition & { typeDefs: string },
) {
  return addMocksToSchema({
    schema: makeExecutableSchema({
      ...options,
      typeDefs: augmentTypeDefsWithCacheControlSupport(options.typeDefs),
    }),
    preserveResolvers: true,
  });
}
