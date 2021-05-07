import type { CacheHint } from 'apollo-server-types';
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
}

declare module 'graphql/type/definition' {
  interface GraphQLResolveInfo {
    cacheControl: {
      setCacheHint: (hint: CacheHint) => void;
      cacheHint: CacheHint;
    };
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
      const hints = new Map<string, CacheHint>();
      requestContext.cacheHints = hints;

      function setOverallCachePolicyWhenUnset() {
        if (!requestContext.overallCachePolicy) {
          requestContext.overallCachePolicy = computeOverallCachePolicy(hints);
        }
      }

      return {
        executionDidStart: () => ({
          // Keep this sync! See ##KeepHooksSync
          executionDidEnd: () => setOverallCachePolicyWhenUnset(),
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

            const path = responsePathAsArray(info.path).join('.');

            if (hint.maxAge !== undefined || hint.scope !== undefined) {
              addHint(hints, path, hint);
            }

            info.cacheControl = {
              setCacheHint: (hint: CacheHint) => {
                addHint(hints, path, hint);
              },
              cacheHint: hint,
            };
          },
        }),

        // Keep this sync! See ##KeepHooksSync.
        responseForOperation() {
          // We are not supplying an answer, we are only setting the cache
          // policy if it's not set! Therefore, we return null.
          setOverallCachePolicyWhenUnset();
          return null;
        },

        // Note: keep this method `sync`! This a bit rickety, but
        // Dispatcher.invokeHookAsync does call hooks in order, and if we keep
        // this sync, it will finish running before later plugins start their
        // hook. That means later plugins can observe what we write here.
        // ##KeepHooksSync
        willSendResponse(requestContext) {
          const {
            response,
            overallCachePolicy: overallCachePolicyOverride,
          } = requestContext;

          // If there are any errors, we don't consider this cacheable.
          if (response.errors) {
            return;
          }

          // Use the override by default, but if it's not overridden, set our
          // own computation onto the `requestContext` for other plugins to read.
          const overallCachePolicy =
            overallCachePolicyOverride ||
            (requestContext.overallCachePolicy = computeOverallCachePolicy(
              hints,
            ));

          if (
            overallCachePolicy &&
            calculateHttpHeaders &&
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

// Exported for testing, not from the package.
export function computeOverallCachePolicy(
  hints: Map<string, CacheHint>,
): Required<CacheHint> | undefined {
  let lowestMaxAge: number | undefined = undefined;
  let scope: CacheScope = CacheScope.Public;

  for (const hint of hints.values()) {
    if (hint.maxAge !== undefined) {
      lowestMaxAge =
        lowestMaxAge !== undefined
          ? Math.min(lowestMaxAge, hint.maxAge)
          : hint.maxAge;
    }
    if (hint.scope === CacheScope.Private) {
      scope = CacheScope.Private;
    }
  }

  // If maxAge is 0, then we consider it uncacheable so it doesn't matter what
  // the scope was.
  return lowestMaxAge
    ? {
        maxAge: lowestMaxAge,
        scope,
      }
    : undefined;
}

// Exported for testing, not from the package.
export function addHint(hints: Map<string, CacheHint>, path: string, hint: CacheHint) {
  const existingCacheHint = hints.get(path);
  if (existingCacheHint) {
    hints.set(path, mergeHints(existingCacheHint, hint));
  } else {
    hints.set(path, hint);
  }
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
