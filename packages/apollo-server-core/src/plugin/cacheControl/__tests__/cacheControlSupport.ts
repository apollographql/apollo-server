import { buildSchema } from 'graphql';
import {
  makeExecutableSchema,
  IExecutableSchemaDefinition,
} from '@graphql-tools/schema';

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
    noDefaultMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE
` + typeDefs
  );
}

export function buildSchemaWithCacheControlSupport(source: string) {
  return buildSchema(augmentTypeDefsWithCacheControlSupport(source));
}

export function makeExecutableSchemaWithCacheControlSupport(
  options: IExecutableSchemaDefinition & { typeDefs: string },
) {
  return makeExecutableSchema({
    ...options,
    typeDefs: augmentTypeDefsWithCacheControlSupport(options.typeDefs),
  });
}
