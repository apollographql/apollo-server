# Cache Control types

This package exports various TypeScript types related to Apollo Server's cache
policy calculation.

Specifically, it gives a type-safe way to get the `info.cacheControl` field in resolvers. Either declare your resolver's `info` argument to be of type `GraphQLResolveInfoWithCacheControl` (perhaps with the graphql-code-generator typescript-resolvers customResolveInfo option), or use the `maybeCacheControlFromInfo` or `cacheControlFromInfo` functions to extract `info.cacheControl` in a type-safe way.
