import type { GraphQLCompositeType } from 'graphql';

/**
 * CacheHint represents a contribution to an overall cache policy. It can
 * specify a maxAge and/or a scope.
 */
export interface CacheHint {
  maxAge?: number;
  scope?: CacheScope;
}

/**
 * CacheAnnotation represents the contents of a `@cacheControl` directive.
 * (`inheritMaxAge` is part of this interface and not CacheHint, because
 * `inheritMaxAge` isn't a contributing piece of a cache policy: it just means
 * to not apply default values in some contexts.)
 */
export interface CacheAnnotation extends CacheHint {
  inheritMaxAge?: true;
}

export type CacheScope = 'PUBLIC' | 'PRIVATE';

/**
 * CachePolicy is a mutable CacheHint with helpful methods for updating its
 * fields.
 */
export interface CachePolicy extends CacheHint {
  /**
   * Mutate this CachePolicy by replacing each field defined in `hint`. This can
   * make the policy more restrictive or less restrictive.
   */
  replace(hint: CacheHint): void;

  /**
   * Mutate this CachePolicy by restricting each field defined in `hint`. This
   * can only make the policy more restrictive: a previously defined `maxAge`
   * can only be reduced, and a previously Private scope cannot be made Public.
   */
  restrict(hint: CacheHint): void;

  /**
   * If this policy has a positive `maxAge`, then return a copy of itself as a
   * `CacheHint` with both fields defined. Otherwise return null.
   */
  policyIfCacheable(): Required<CacheHint> | null;
}

/**
 * When using Apollo Server with the cache control plugin (on by default), an
 * object of this kind is available to resolvers on `info.cacheControl`.
 */
export interface ResolveInfoCacheControl {
  cacheHint: CachePolicy;
  // Shorthand for `cacheHint.replace(hint)`; also for compatibility with
  // the Apollo Server 2.x API.
  setCacheHint(hint: CacheHint): void;

  cacheHintFromType(t: GraphQLCompositeType): CacheHint | undefined;
}

declare module 'graphql/type/definition' {
  interface GraphQLResolveInfo {
    cacheControl: ResolveInfoCacheControl;
  }
}
