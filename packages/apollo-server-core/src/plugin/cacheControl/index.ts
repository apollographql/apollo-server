import type { CacheHint, GraphQLRequestContext } from 'apollo-server-types';
import { CacheScope } from 'apollo-server-types';
import {
  DirectiveNode,
  getNamedType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  responsePathAsArray,
} from 'graphql';
import type { InternalApolloServerPlugin } from '../../internalPlugin';
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
      setCacheHint: (hint: CacheHint) => void;
      cacheHint: CacheHint;
    };
  }
}

// Exported for tests only.
export class PolicyUpdater {
  private overallCachePolicyIsUncacheable = false;
  constructor(
    private requestContext: Pick<GraphQLRequestContext, 'overallCachePolicy'>,
  ) {}
  addHint(hint: CacheHint) {
    // If we've already seen that some piece of the response has maxAge 0,
    // then there's nothing we can learn that can change the policy from
    // undefined.
    if (this.overallCachePolicyIsUncacheable) {
      return;
    }

    // If this piece is entirely uncacheable, then the overall policy is
    // undefined (uncacheable) and no information we learn later can change
    // our mind. (This is distinct from "the policy we've learned so far is
    // 'undefined' but that's just because we haven't seen any hints yet".)
    if (hint.maxAge === 0) {
      this.requestContext.overallCachePolicy = undefined;
      this.overallCachePolicyIsUncacheable = true;
      return;
    }

    if (!this.requestContext.overallCachePolicy) {
      if (hint.maxAge === undefined) {
        // This shouldn't happen. If we've gotten this far, then the reason
        // requestContext.overallCachePolicy is unset is because we haven't seen
        // any hints yet, not because some hint told us that the operation is
        // uncacheable (overallCachePolicyIsUncacheable would have been true
        // otherwise). Every time we start to resolve a field, this function
        // gets called. So this must be the first field we're resolving, which
        // means it must be a root field. But root field maxAge is always a
        // number. So this shouldn't happen.
        throw Error("Shouldn't happen: first hint has undefined maxAge?");
      }
      this.requestContext.overallCachePolicy = {
        maxAge: hint.maxAge,
        scope: hint.scope ?? CacheScope.Public,
      };
      return;
    }

    // OK! We already have a cache policy, and we have a new hint. Let's
    // combine! Take the minimum maxAge and the privatest scope.
    if (
      hint.maxAge !== undefined &&
      hint.maxAge < this.requestContext.overallCachePolicy.maxAge
    ) {
      this.requestContext.overallCachePolicy.maxAge = hint.maxAge;
    }
    if (hint.scope === CacheScope.Private) {
      this.requestContext.overallCachePolicy.scope = CacheScope.Private;
    }
  }
}

export function ApolloServerPluginCacheControl(
  options: ApolloServerPluginCacheControlOptions = Object.create(null),
): InternalApolloServerPlugin {
  return {
    __internal_plugin_id__() {
      return 'CacheControl';
    },

    requestDidStart(requestContext) {
      const defaultMaxAge: number = options.defaultMaxAge ?? 0;
      const calculateHttpHeaders = options.calculateHttpHeaders ?? true;
      const { __testing__cacheHints } = options;

      return {
        executionDidStart: () => {
          let policyUpdater: PolicyUpdater | undefined;

          // Did something set the overall cache policy before we've even
          // started? If so, consider that as an override and don't touch it.
          // Otherwise, create a PolicyUpdater which tracks a tiny bit of state
          // and updates requestContext.overallCachePolicy when necessary.
          //
          // XXX I'm not really sure when requestContext.overallCachePolicy
          // could be already set. The main use case for setting
          // overallCachePolicy outside of this plugin is
          // apollo-server-plugin-response-cache, but when it sets the policy we
          // never get to execution at all! This is preserving behavior
          // introduced in #3997 but I'm not sure it was ever actually
          // necessary.
          if (!requestContext.overallCachePolicy) {
            policyUpdater = new PolicyUpdater(requestContext);
          }

          return {
            willResolveField({ info }) {
              let hint: CacheHint = {};

              // If this field's resolver returns an object or interface, look for
              // hints on that return type.
              const targetType = getNamedType(info.returnType);
              if (
                targetType instanceof GraphQLObjectType ||
                targetType instanceof GraphQLInterfaceType
              ) {
                if (targetType.astNode) {
                  hint = mergeHints(
                    hint,
                    cacheHintFromDirectives(targetType.astNode.directives),
                  );
                }
              }

              // Look for hints on the field itself (on its parent type), taking
              // precedence over previously calculated hints.
              const fieldDef = info.parentType.getFields()[info.fieldName];
              if (fieldDef.astNode) {
                hint = mergeHints(
                  hint,
                  cacheHintFromDirectives(fieldDef.astNode.directives),
                );
              }

              // If this resolver returns an object or is a root field and we haven't
              // seen an explicit maxAge hint, set the maxAge to 0 (uncached) or the
              // default if specified in the constructor. (Non-object fields by
              // default are assumed to inherit their cacheability from their parents.
              // But on the other hand, while root non-object fields can get explicit
              // hints from their definition on the Query/Mutation object, if that
              // doesn't exist then there's no parent field that would assign the
              // default maxAge, so we do it here.)
              if (
                (targetType instanceof GraphQLObjectType ||
                  targetType instanceof GraphQLInterfaceType ||
                  !info.path.prev) &&
                hint.maxAge === undefined
              ) {
                hint.maxAge = defaultMaxAge;
              }

              info.cacheControl = {
                setCacheHint: (dynamicHint: CacheHint) => {
                  hint = mergeHints(hint, dynamicHint);
                },
                cacheHint: hint,
              };

              // When the field is done, call addHint once. By calling addHint
              // once, we don't need to "undo" the effect on overallCachePolicy
              // of a static hint that gets refined by a dynamic hint.
              return () => {
                if (hint.maxAge !== undefined || hint.scope !== undefined) {
                  if (__testing__cacheHints) {
                    const path = responsePathAsArray(info.path).join('.');
                    if (__testing__cacheHints.has(path)) {
                      throw Error(
                        "shouldn't happen: addHint should only be called once per path",
                      );
                    }
                    __testing__cacheHints.set(path, hint);
                  }
                  policyUpdater?.addHint(hint);
                }
              };
            },
          };
        },

        willSendResponse(requestContext) {
          const { response, overallCachePolicy } = requestContext;

          // If the feature is enabled, there is a non-trivial cache policy,
          // there are no errors, and we actually can write headers, write the
          // header.
          if (
            calculateHttpHeaders &&
            overallCachePolicy &&
            !response.errors &&
            response.http
          ) {
            response.http.headers.set(
              'Cache-Control',
              `max-age=${
                overallCachePolicy.maxAge
              }, ${overallCachePolicy.scope.toLowerCase()}`,
            );
          }
        },
      };
    },
  };
}

function cacheHintFromDirectives(
  directives: ReadonlyArray<DirectiveNode> | undefined,
): CacheHint | undefined {
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

  // TODO: Add proper typechecking of arguments
  return {
    maxAge:
      maxAgeArgument &&
      maxAgeArgument.value &&
      maxAgeArgument.value.kind === 'IntValue'
        ? parseInt(maxAgeArgument.value.value)
        : undefined,
    scope:
      scopeArgument &&
      scopeArgument.value &&
      scopeArgument.value.kind === 'EnumValue'
        ? (scopeArgument.value.value as CacheScope)
        : undefined,
  };
}

function mergeHints(
  hint: CacheHint,
  otherHint: CacheHint | undefined,
): CacheHint {
  if (!otherHint) return hint;

  return {
    maxAge: otherHint.maxAge !== undefined ? otherHint.maxAge : hint.maxAge,
    scope: otherHint.scope || hint.scope,
  };
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
