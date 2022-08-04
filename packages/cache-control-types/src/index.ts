// NOTE: Once Apollo Server 4 is released, move this package into the
// apollo-server repo. We're placing it in the apollo-utils repo for now to
// enable us to make non-alpha releases that can be used on the apollo-server
// version-4 branch.

import type { GraphQLCompositeType, GraphQLResolveInfo } from "graphql";

/**
 * CacheScope represents whether cacheable data should be shared across sessions
 * (PUBLIC) or considered session-specific (PRIVATE).
 */
export type CacheScope = "PUBLIC" | "PRIVATE";

/**
 * CacheHint represents a contribution to an overall cache policy. It can
 * specify a maxAge and/or a scope.
 */
export interface CacheHint {
  maxAge?: number;
  scope?: CacheScope;
}

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

/** When using Apollo Server with the cache control plugin (on by default), the
 * `info` argument to resolvers can be considered to be of this type. (You can
 * use this type with the customResolveInfo option to the graphql-code-generator
 * typescript-resolvers plugin, for example.) */
export interface GraphQLResolveInfoWithCacheControl
  extends Omit<GraphQLResolveInfo, "cacheControl"> {
  // Why the Omit above? If you happen to have AS2 `apollo-cache-control` or AS3
  // `apollo-server-core` in your TypeScript build, then there's an ambient
  // `declare module` floating around that monkey-patches GraphQLResolveInfo to
  // have a cacheControl field. This led to lots of problems, which is why in
  // AS4 we're moving towards the approach in this file where don't assume every
  // GraphQLResolveInfo is a GraphQLResolveInfoWithCacheControl. The AS3 type is
  // very slightly incompatible with the type in the file, since we changed
  // CacheScope to be a union of strings rather than an enum. They have the same
  // runtime representation so it's safe to ignore, but in order for the
  // `extends` to not error out if you're building with the old ambient
  // definition floating around too, we need the Omit.
  cacheControl: ResolveInfoCacheControl;
}

/** Given an `info` resolver argument, returns the cacheControl field if it
 * exists and appears to be from Apollo Server 3 or newer; returns null
 * otherwise.*/
export function maybeCacheControlFromInfo(
  info: GraphQLResolveInfo,
): ResolveInfoCacheControl | null {
  if ((info as any).cacheControl?.cacheHint?.restrict) {
    return (info as any).cacheControl;
  }
  return null;
}

/** Given an `info` resolver argument, returns the cacheControl field if it
 * exists and appears to be from Apollo Server 3 or newer; throws
 * otherwise.*/
export function cacheControlFromInfo(
  info: GraphQLResolveInfo,
): ResolveInfoCacheControl {
  if (!("cacheControl" in info)) {
    throw new Error(
      "The `info` argument does not appear to have a cacheControl field. " +
        "Check that you are using Apollo Server 3 or newer and that you aren't using " +
        "ApolloServerPluginCacheControlDisabled.",
    );
  }
  if (!(info as any).cacheControl?.cacheHint?.restrict) {
    throw new Error(
      "The `info` argument has a cacheControl field but it does not appear to be from Apollo" +
        "Server 3 or newer. Check that you are using Apollo Server 3 or newer and that you aren't using " +
        "ApolloServerPluginCacheControlDisabled.",
    );
  }
  return (info as any).cacheControl;
}
