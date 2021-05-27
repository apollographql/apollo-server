import type {
  CacheHint,
  CachePolicy,
} from 'apollo-server-types';
import { CacheScope } from 'apollo-server-types';
import {
  DirectiveNode,
  getNamedType,
  GraphQLCompositeType,
  GraphQLField,
  GraphQLInterfaceType,
  GraphQLObjectType,
  isCompositeType,
  isInterfaceType,
  isObjectType,
  ResponsePath,
  responsePathAsArray,
} from 'graphql';
import { newCachePolicy } from '../../cachePolicy';
import type { InternalApolloServerPlugin } from '../../internalPlugin';
import LRUCache from 'lru-cache';

export interface ApolloServerPluginCacheControlOptions {
  /**
   * All root fields and fields returning objects or interfaces have this value
   * for `maxAge` unless they set a cache hint with a non-undefined `maxAge`
   * using `@cacheControl` or `setCacheHint`. The default is 0, which means "not
   * cachable". (That is: if you don't set `defaultMaxAge`, then every root
   * field in your operation and every field with sub-fields must have a cache
   * hint or the overall operation will not be cacheable.)
   */
  defaultMaxAge?: number;
  /**
   * Determines whether to set the `Cache-Control` HTTP header on cacheable
   * responses with no errors. The default is true.
   */
  calculateHttpHeaders?: boolean;
  // For testing only.
  __testing__cacheHints?: Map<string, CacheHint>;
}

declare module 'graphql/type/definition' {
  interface GraphQLResolveInfo {
    cacheControl: {
      cacheHint: CachePolicy;
      // Shorthand for `cacheHint.replace(hint)`; also for compatibility with
      // the Apollo Server 2.x API.
      setCacheHint(hint: CacheHint): void;
      cacheHintFromType(t: GraphQLCompositeType): CacheHint | undefined;
    };
  }
}

// Represents the `@cacheControl` directive that can appear on a field.
export interface CacheFieldHint extends CacheHint {
  noDefaultMaxAge?: boolean;
}

export function ApolloServerPluginCacheControl(
  options: ApolloServerPluginCacheControlOptions = Object.create(null),
): InternalApolloServerPlugin {
  const typeCacheHintCache = new LRUCache<GraphQLCompositeType, CacheHint>();
  const fieldCacheHintCache = new LRUCache<
    GraphQLField<unknown, unknown>,
    CacheFieldHint
  >();

  function memoizedCacheHintFromType(t: GraphQLCompositeType): CacheHint {
    const cachedHint = typeCacheHintCache.get(t);
    if (cachedHint) {
      return cachedHint;
    }
    const hint = cacheHintFromType(t);
    typeCacheHintCache.set(t, hint);
    return hint;
  }

  function memoizedCacheHintFromField(
    field: GraphQLField<unknown, unknown>,
  ): CacheFieldHint {
    const cachedHint = fieldCacheHintCache.get(field);
    if (cachedHint) {
      return cachedHint;
    }
    const hint = cacheHintFromField(field);
    fieldCacheHintCache.set(field, hint);
    return hint;
  }

  return {
    __internal_plugin_id__() {
      return 'CacheControl';
    },

    serverWillStart({ schema }) {
      // Set the size of the caches to be equal to the number of composite types
      // and fields in the schema respectively. This generally means that the
      // cache will always have room for all the cache hints in the active
      // schema but we won't have a memory leak as schemas are replaced in a
      // gateway. (Once https://github.com/apollographql/apollo-server/pull/5187
      // lands we should also run this code from a schemaDidLoadOrUpdate
      // callback.)
      typeCacheHintCache.max = Object.values(schema.getTypeMap()).filter(
        isCompositeType,
      ).length;
      fieldCacheHintCache.max =
        Object.values(schema.getTypeMap())
          .filter(isObjectType)
          .flatMap((t) => Object.values(t.getFields())).length +
        Object.values(schema.getTypeMap())
          .filter(isInterfaceType)
          .flatMap((t) => Object.values(t.getFields())).length;
    },

    requestDidStart(requestContext) {
      const defaultMaxAge: number = options.defaultMaxAge ?? 0;
      const calculateHttpHeaders = options.calculateHttpHeaders ?? true;
      const { __testing__cacheHints } = options;

      // These are the ResponsePaths that we treat as being "root paths", in the
      // sense that scalar children of these paths receive `defaultMaxAge` for
      // their `maxAge` (unless they receive a `maxAge` via some other mechanism
      // or they explicitly request `noDefaultMaxAge`). This includes the actual
      // root as well as any path consisting entirely of fields with no `maxAge`
      // (due to setting `noDefaultMaxAge` and not setting `maxAge` in some
      // other way).
      const effectiveRootPaths = new Set<ResponsePath | undefined>();
      // The actual root is an effective root path.
      effectiveRootPaths.add(undefined);

      return {
        executionDidStart: () => {
          // Did something set the overall cache policy before we've even
          // started? If so, consider that as an override and don't touch it.
          // Just put set up fake `info.cacheControl` objects and otherwise
          // don't track cache policy.
          //
          // (This doesn't happen in practice using the core plugins: the main
          // use case for restricting overallCachePolicy outside of this plugin
          // is apollo-server-plugin-response-cache, but when it sets the policy
          // we never get to execution at all.)
          if (isRestricted(requestContext.overallCachePolicy)) {
            // This is "fake" in the sense that it never actually affects
            // requestContext.overallCachePolicy.
            const fakeFieldPolicy = newCachePolicy();
            return {
              willResolveField({ info }) {
                info.cacheControl = {
                  setCacheHint: (dynamicHint: CacheHint) => {
                    fakeFieldPolicy.replace(dynamicHint);
                  },
                  cacheHint: fakeFieldPolicy,
                  cacheHintFromType: memoizedCacheHintFromType,
                };
              },
            };
          }

          return {
            willResolveField({ info }) {
              const fieldPolicy = newCachePolicy();

              // If this field's resolver returns an object or interface, look for
              // hints on that return type.
              // XXX This should also handled union-valued fields; going to deal
              // with this in a separate PR.
              const targetType = getNamedType(info.returnType);
              if (
                targetType instanceof GraphQLObjectType ||
                targetType instanceof GraphQLInterfaceType
              ) {
                fieldPolicy.replace(memoizedCacheHintFromType(targetType));
              }

              // Look for hints on the field itself (on its parent type), taking
              // precedence over previously calculated hints.
              const fieldHint = memoizedCacheHintFromField(
                info.parentType.getFields()[info.fieldName],
              );

              let noDefaultMaxAge = false;
              if (
                fieldHint.noDefaultMaxAge &&
                fieldPolicy.maxAge === undefined
              ) {
                noDefaultMaxAge = true;
                // If this is field on root, or on a series of other fields
                // that have no maxAge due to defaultMaxAge, then remember
                // that this too is an effective root path.
                if (effectiveRootPaths.has(skipListIndexes(info.path.prev))) {
                  effectiveRootPaths.add(info.path);
                }
                // Handle `@cacheControl(noDefaultMaxAge: true, scope: PRIVATE)`.
                if (fieldHint.scope) {
                  fieldPolicy.replace({ scope: fieldHint.scope });
                }
              } else {
                fieldPolicy.replace(fieldHint);
              }

              // If this resolver returns an object or is a root field and we
              // haven't seen an explicit maxAge hint, set the maxAge to 0
              // (uncached) or the default if specified in the constructor.
              // (Non-object fields by default are assumed to inherit their
              // cacheability from their parents. But on the other hand, while
              // root non-object fields can get explicit hints from their
              // definition on the Query/Mutation object, if that doesn't exist
              // then there's no parent field that would assign the default
              // maxAge, so we do it here.)
              //
              // You can disable this on a field by writing
              // `@cacheControl(noDefaultMaxAge: true)` on it. If you do this,
              // then its children will be treated like root paths, since there
              // is no parent maxAge to inherit.
              if (
                fieldPolicy.maxAge === undefined &&
                !noDefaultMaxAge &&
                // FIXME unions too
                (targetType instanceof GraphQLObjectType ||
                  targetType instanceof GraphQLInterfaceType ||
                  effectiveRootPaths.has(skipListIndexes(info.path.prev)))
              ) {
                fieldPolicy.restrict({ maxAge: defaultMaxAge });
              }

              info.cacheControl = {
                setCacheHint: (dynamicHint: CacheHint) => {
                  fieldPolicy.replace(dynamicHint);
                },
                cacheHint: fieldPolicy,
                cacheHintFromType,
              };

              // When the field is done, call addHint once. By calling addHint
              // once, we don't need to "undo" the effect on overallCachePolicy
              // of a static hint that gets refined by a dynamic hint.
              return () => {
                // If the field had `@cacheControl(noDefaultMaxAge: true)` but
                // then we dynamically set a hint, then it's no longer an
                // effective root path, and its scalar children get to act
                // like normal scalars by inheriting its maxAge.
                if (noDefaultMaxAge && fieldPolicy.maxAge !== undefined) {
                  effectiveRootPaths.delete(info.path);
                }

                if (__testing__cacheHints && isRestricted(fieldPolicy)) {
                  const path = responsePathAsArray(info.path).join('.');
                  if (__testing__cacheHints.has(path)) {
                    throw Error(
                      "shouldn't happen: addHint should only be called once per path",
                    );
                  }
                  __testing__cacheHints.set(path, {
                    maxAge: fieldPolicy.maxAge,
                    scope: fieldPolicy.scope,
                  });
                }
                requestContext.overallCachePolicy.restrict(fieldPolicy);
              };
            },
          };
        },

        willSendResponse(requestContext) {
          const { response, overallCachePolicy } = requestContext;

          const policyIfCacheable = overallCachePolicy.policyIfCacheable();

          // If the feature is enabled, there is a non-trivial cache policy,
          // there are no errors, and we actually can write headers, write the
          // header.
          if (
            calculateHttpHeaders &&
            policyIfCacheable &&
            !response.errors &&
            response.http
          ) {
            response.http.headers.set(
              'Cache-Control',
              `max-age=${
                policyIfCacheable.maxAge
              }, ${policyIfCacheable.scope.toLowerCase()}`,
            );
          }
        },
      };
    },
  };
}

function cacheHintFromDirectives(
  directives: ReadonlyArray<DirectiveNode> | undefined,
  allowNoDefaultMaxAge: boolean,
): CacheFieldHint | undefined {
  if (!directives) return undefined;

  const cacheControlDirective = directives.find(
    (directive) => directive.name.value === 'cacheControl',
  );
  if (!cacheControlDirective) return undefined;

  if (!cacheControlDirective.arguments) return undefined;

  const maxAgeArgument = cacheControlDirective.arguments.find(
    (argument) => argument.name.value === 'maxAge',
  );
  const scopeArgument = cacheControlDirective.arguments.find(
    (argument) => argument.name.value === 'scope',
  );
  const noDefaultMaxAgeArgument = cacheControlDirective.arguments.find(
    (argument) => argument.name.value === 'noDefaultMaxAge',
  );

  const scope =
    scopeArgument &&
    scopeArgument.value &&
    scopeArgument.value.kind === 'EnumValue'
      ? (scopeArgument.value.value as CacheScope)
      : undefined;

  if (
    allowNoDefaultMaxAge &&
    noDefaultMaxAgeArgument &&
    noDefaultMaxAgeArgument.value &&
    noDefaultMaxAgeArgument.value.kind === 'BooleanValue' &&
    noDefaultMaxAgeArgument.value.value
  ) {
    // We ignore maxAge if it is also specified.
    return { noDefaultMaxAge: true, scope };
  }

  // TODO: Add proper typechecking of arguments
  return {
    maxAge:
      maxAgeArgument &&
      maxAgeArgument.value &&
      maxAgeArgument.value.kind === 'IntValue'
        ? parseInt(maxAgeArgument.value.value)
        : undefined,
    scope,
  };
}

function cacheHintFromType(t: GraphQLCompositeType): CacheHint {
  if (t.astNode) {
    const hint = cacheHintFromDirectives(t.astNode.directives, false);
    if (hint) {
      return hint;
    }
  }
  if (t.extensionASTNodes) {
    for (const node of t.extensionASTNodes) {
      const hint = cacheHintFromDirectives(node.directives, false);
      if (hint) {
        return hint;
      }
    }
  }
  return {};
}

function cacheHintFromField(
  field: GraphQLField<unknown, unknown>,
): CacheFieldHint {
  if (field.astNode) {
    const hint = cacheHintFromDirectives(field.astNode.directives, true);
    if (hint) {
      return hint;
    }
  }
  return {};
}

function isRestricted(hint: CacheHint) {
  return hint.maxAge !== undefined || hint.scope !== undefined;
}

// Returns the closest ancestor of `path` that doesn't end in a list index.
function skipListIndexes(
  path: ResponsePath | undefined,
): ResponsePath | undefined {
  if (!path) {
    return undefined;
  }
  if (typeof path.key === 'string') {
    return path;
  }
  if (!path.prev) {
    throw Error(
      `First element of path ${responsePathAsArray(path).join(
        '.',
      )} is an array?`,
    );
  }
  return skipListIndexes(path.prev);
}

// This plugin does nothing, but it ensures that ApolloServer won't try
// to add a default ApolloServerPluginCacheControl.
export function ApolloServerPluginCacheControlDisabled(): InternalApolloServerPlugin {
  return {
    __internal_plugin_id__() {
      return 'CacheControl';
    },
  };
}
