import { buildSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';

type FirstArg<F> = F extends (arg: infer A) => any ? A : never;

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
  ) on FIELD_DEFINITION | OBJECT | INTERFACE
` + typeDefs
  );
}

export function buildSchemaWithCacheControlSupport(source: string) {
  return buildSchema(augmentTypeDefsWithCacheControlSupport(source));
}

export function makeExecutableSchemaWithCacheControlSupport(
  options: FirstArg<typeof makeExecutableSchema> & { typeDefs: string },
) {
  return makeExecutableSchema({
    ...options,
    typeDefs: augmentTypeDefsWithCacheControlSupport(options.typeDefs),
  });
}
