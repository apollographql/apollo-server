import type { ApolloServerPlugin } from '../../externalTypes/index.js';
import {
  type DirectiveNode,
  getNamedType,
  type GraphQLCompositeType,
  type GraphQLField,
  isCompositeType,
  isInterfaceType,
  isObjectType,
  responsePathAsArray,
} from 'graphql';
import { newCachePolicy } from '../../cachePolicy.js';
import { internalPlugin } from '../../internalPlugin.js';
import LRUCache from 'lru-cache';
import type {
  CacheHint,
  CacheScope,
  GraphQLResolveInfoWithCacheControl,
} from '@apollo/cache-control-types';

/**
 * CacheAnnotation represents the contents of a `@cacheControl` directive.
 * (`inheritMaxAge` is part of this interface and not CacheHint, because
 * `inheritMaxAge` isn't a contributing piece of a cache policy: it just means
 * to not apply default values in some contexts.)
 */
interface CacheAnnotation extends CacheHint {
  inheritMaxAge?: true;
}

export interface ApolloServerPluginCacheControlOptions {
  /**
   * All root fields and fields returning objects or interfaces have this value
   * for `maxAge` unless they set a cache hint with a non-undefined `maxAge`
   * using `@cacheControl` or `setCacheHint`. The default is 0, which means "not
   * cacheable". (That is: if you don't set `defaultMaxAge`, then every root
   * field in your operation and every field with sub-fields must have a cache
   * hint or the overall operation will not be cacheable.)
   */
  defaultMaxAge?: number;
  /**
   * Determines whether to set the `Cache-Control` HTTP header. If true (the
   * default), the header is written on all responses (with a value of
   * `no-store` for non-cacheable responses). If `'if-cacheable'`, the header is
   * only written for cacheable responses. If false, the header is never
   * written. A response is cacheable if its overall cache policy has a non-zero
   * `maxAge`, and the body is a single result rather than an incremental
   * delivery response, and the body contains no errors.
   */
  calculateHttpHeaders?: boolean | 'if-cacheable';
  // For testing only.
  __testing__cacheHints?: Map<string, CacheHint>;
}

export function ApolloServerPluginCacheControl(
  options: ApolloServerPluginCacheControlOptions = Object.create(null),
): ApolloServerPlugin {
  let typeAnnotationCache: LRUCache<GraphQLCompositeType, CacheAnnotation>;

  let fieldAnnotationCache: LRUCache<
    GraphQLField<unknown, unknown>,
    CacheAnnotation
  >;

  return internalPlugin({
    __internal_plugin_id__: 'CacheControl',
    __is_disabled_plugin__: false,

    async serverWillStart({ schema }) {
      // Set the size of the caches to be equal to the number of composite types
      // and fields in the schema respectively. This generally means that the
      // cache will always have room for all the cache hints in the active
      // schema but we won't have a memory leak as schemas are replaced in a
      // gateway. (Once we're comfortable breaking compatibility with
      // versions of Gateway older than 0.35.0, we should also run this code
      // from a schemaDidLoadOrUpdate instead of serverWillStart. Using
      // schemaDidLoadOrUpdate throws when combined with old gateways.)
      typeAnnotationCache = new LRUCache<GraphQLCompositeType, CacheAnnotation>(
        {
          max: Object.values(schema.getTypeMap()).filter(isCompositeType)
            .length,
        },
      );

      fieldAnnotationCache = new LRUCache<
        GraphQLField<unknown, unknown>,
        CacheAnnotation
      >({
        max:
          Object.values(schema.getTypeMap())
            .filter(isObjectType)
            .flatMap((t) => Object.values(t.getFields())).length +
          Object.values(schema.getTypeMap())
            .filter(isInterfaceType)
            .flatMap((t) => Object.values(t.getFields())).length,
      });

      return undefined;
    },

    async requestDidStart(requestContext) {
      function memoizedCacheAnnotationFromType(
        t: GraphQLCompositeType,
      ): CacheAnnotation {
        const existing = typeAnnotationCache.get(t);
        if (existing) {
          return existing;
        }
        const annotation = cacheAnnotationFromType(t);
        typeAnnotationCache.set(t, annotation);
        return annotation;
      }

      function memoizedCacheAnnotationFromField(
        field: GraphQLField<unknown, unknown>,
      ): CacheAnnotation {
        const existing = fieldAnnotationCache.get(field);
        if (existing) {
          return existing;
        }
        const annotation = cacheAnnotationFromField(field);
        fieldAnnotationCache.set(field, annotation);
        return annotation;
      }

      const defaultMaxAge: number = options.defaultMaxAge ?? 0;
      const calculateHttpHeaders = options.calculateHttpHeaders ?? true;
      const { __testing__cacheHints } = options;

      return {
        async executionDidStart() {
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
                // This `as` is "safe" in the sense that this is the statement
                // that makes a GraphQLResolveInfo into a
                // GraphQLResolveInfoWithCacheControl.
                (info as GraphQLResolveInfoWithCacheControl).cacheControl = {
                  setCacheHint: (dynamicHint: CacheHint) => {
                    fakeFieldPolicy.replace(dynamicHint);
                  },
                  cacheHint: fakeFieldPolicy,
                  cacheHintFromType: memoizedCacheAnnotationFromType,
                };
              },
            };
          }

          return {
            willResolveField({ info }) {
              const fieldPolicy = newCachePolicy();

              let inheritMaxAge = false;

              // If this field's resolver returns an object/interface/union
              // (maybe wrapped in list/non-null), look for hints on that return
              // type.
              const targetType = getNamedType(info.returnType);
              if (isCompositeType(targetType)) {
                const typeAnnotation =
                  memoizedCacheAnnotationFromType(targetType);
                fieldPolicy.replace(typeAnnotation);
                inheritMaxAge = !!typeAnnotation.inheritMaxAge;
              }

              // Look for hints on the field itself (on its parent type), taking
              // precedence over previously calculated hints.
              const fieldAnnotation = memoizedCacheAnnotationFromField(
                info.parentType.getFields()[info.fieldName],
              );

              // Note that specifying `@cacheControl(inheritMaxAge: true)` on a
              // field whose return type defines a `maxAge` gives precedence to
              // the type's `maxAge`. (Perhaps this should be some sort of
              // error.)
              if (
                fieldAnnotation.inheritMaxAge &&
                fieldPolicy.maxAge === undefined
              ) {
                inheritMaxAge = true;
                // Handle `@cacheControl(inheritMaxAge: true, scope: PRIVATE)`.
                // (We ignore any specified `maxAge`; perhaps it should be some
                // sort of error.)
                if (fieldAnnotation.scope) {
                  fieldPolicy.replace({ scope: fieldAnnotation.scope });
                }
              } else {
                fieldPolicy.replace(fieldAnnotation);
              }

              // This `as` is "safe" in the sense that this is the statement
              // that makes a GraphQLResolveInfo into a
              // GraphQLResolveInfoWithCacheControl.
              (info as GraphQLResolveInfoWithCacheControl).cacheControl = {
                setCacheHint: (dynamicHint: CacheHint) => {
                  fieldPolicy.replace(dynamicHint);
                },
                cacheHint: fieldPolicy,
                cacheHintFromType: memoizedCacheAnnotationFromType,
              };

              // When the resolver is done, call restrict once. By calling
              // restrict after the resolver instead of before, we don't need to
              // "undo" the effect on overallCachePolicy of a static hint that
              // gets refined by a dynamic hint.
              return () => {
                // If this field returns a composite type or is a root field and
                // we haven't seen an explicit maxAge hint, set the maxAge to 0
                // (uncached) or the default if specified in the constructor.
                // (Non-object fields by default are assumed to inherit their
                // cacheability from their parents. But on the other hand, while
                // root non-object fields can get explicit hints from their
                // definition on the Query/Mutation object, if that doesn't
                // exist then there's no parent field that would assign the
                // default maxAge, so we do it here.)
                //
                // You can disable this on a non-root field by writing
                // `@cacheControl(inheritMaxAge: true)` on it. If you do this,
                // then its children will be treated like root paths, since
                // there is no parent maxAge to inherit.
                //
                // We do this in the end hook so that dynamic cache control
                // prevents it from happening (eg,
                // `info.cacheControl.cacheHint.restrict({maxAge: 60})` should
                // work rather than doing nothing because we've already set the
                // max age to the default of 0). This also lets resolvers assume
                // any hint in `info.cacheControl.cacheHint` was explicitly set.
                if (
                  fieldPolicy.maxAge === undefined &&
                  ((isCompositeType(targetType) && !inheritMaxAge) ||
                    !info.path.prev)
                ) {
                  fieldPolicy.restrict({ maxAge: defaultMaxAge });
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

        async willSendResponse(requestContext) {
          // This hook is just for setting response headers, so make sure that
          // hasn't been disabled.
          if (!calculateHttpHeaders) {
            return;
          }

          const { response, overallCachePolicy } = requestContext;

          // Look to see if something has already set the cache-control header.
          // This could be a different plugin... or it could be this very plugin
          // operating on a different operation in the same batched HTTP
          // request.
          const existingCacheControlHeader = parseExistingCacheControlHeader(
            response.http.headers.get('cache-control'),
          );

          // If the header contains something other than a value that this
          // plugin sets, then we leave it alone. We don't want to mangle
          // something important that you set! That said, it's probably best to
          // have only one piece of code that writes to a given header, so you
          // should probably set `calculateHttpHeaders: false` on this plugin.
          if (existingCacheControlHeader.kind === 'unparsable') {
            return;
          }

          const cachePolicy = newCachePolicy();
          cachePolicy.replace(overallCachePolicy);
          if (existingCacheControlHeader.kind === 'parsable-and-cacheable') {
            cachePolicy.restrict(existingCacheControlHeader.hint);
          }
          const policyIfCacheable = cachePolicy.policyIfCacheable();

          if (
            // This code path is only for if we believe it is cacheable.
            policyIfCacheable &&
            // Either there wasn't a cache-control header already, or we've
            // already incorporated it into policyIfCacheable. (If we couldn't
            // parse it, that means some other plugin or mechanism set the
            // header. This is confusing, so we just don't make any more
            // changes. You should probably set `calculateHttpHeaders` to false
            // in that case and only set the header from one place.)
            existingCacheControlHeader.kind !== 'uncacheable' &&
            // At least for now, we don't set cache-control headers for
            // incremental delivery responses, since we don't know if a later
            // part of the execution will affect the cache policy (perhaps
            // dynamically). (Note that willSendResponse is called when the
            // initial payload is sent, not the final payload.)
            response.body.kind === 'single' &&
            !response.body.singleResult.errors
          ) {
            response.http.headers.set(
              'cache-control',
              `max-age=${
                policyIfCacheable.maxAge
              }, ${policyIfCacheable.scope.toLowerCase()}`,
            );
          } else if (calculateHttpHeaders !== 'if-cacheable') {
            // The response is not cacheable, so make sure it doesn't get
            // cached. This is especially important for GET requests, because
            // browsers and other agents cache many GET requests by default.
            // (But if some other plugin set the header to a value that this
            // plugin does not produce, we don't do anything.)
            response.http.headers.set(
              'cache-control',
              CACHE_CONTROL_HEADER_UNCACHEABLE,
            );
          }
        },
      };
    },
  });
}

const CACHE_CONTROL_HEADER_CACHEABLE_REGEXP =
  /^max-age=(\d+), (public|private)$/;
const CACHE_CONTROL_HEADER_UNCACHEABLE = 'no-store';

type ExistingCacheControlHeader =
  | { kind: 'no-header' }
  | { kind: 'uncacheable' }
  | { kind: 'parsable-and-cacheable'; hint: CacheHint }
  | { kind: 'unparsable' };

function parseExistingCacheControlHeader(
  header: string | undefined,
): ExistingCacheControlHeader {
  if (!header) {
    return { kind: 'no-header' };
  }
  if (header === CACHE_CONTROL_HEADER_UNCACHEABLE) {
    return { kind: 'uncacheable' };
  }
  const match = CACHE_CONTROL_HEADER_CACHEABLE_REGEXP.exec(header);
  if (!match) {
    return { kind: 'unparsable' };
  }
  return {
    kind: 'parsable-and-cacheable',
    hint: {
      maxAge: +match[1],
      scope: match[2] === 'public' ? 'PUBLIC' : 'PRIVATE',
    },
  };
}

function cacheAnnotationFromDirectives(
  directives: ReadonlyArray<DirectiveNode> | undefined,
): CacheAnnotation | undefined {
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
  const inheritMaxAgeArgument = cacheControlDirective.arguments.find(
    (argument) => argument.name.value === 'inheritMaxAge',
  );

  const scopeString =
    scopeArgument?.value?.kind === 'EnumValue'
      ? scopeArgument.value.value
      : undefined;

  const scope: CacheScope | undefined =
    scopeString === 'PUBLIC' || scopeString === 'PRIVATE'
      ? scopeString
      : undefined;

  if (
    inheritMaxAgeArgument?.value?.kind === 'BooleanValue' &&
    inheritMaxAgeArgument.value.value
  ) {
    // We ignore maxAge if it is also specified.
    return { inheritMaxAge: true, scope };
  }

  return {
    maxAge:
      maxAgeArgument?.value?.kind === 'IntValue'
        ? parseInt(maxAgeArgument.value.value)
        : undefined,
    scope,
  };
}

function cacheAnnotationFromType(t: GraphQLCompositeType): CacheAnnotation {
  if (t.astNode) {
    const hint = cacheAnnotationFromDirectives(t.astNode.directives);
    if (hint) {
      return hint;
    }
  }
  if (t.extensionASTNodes) {
    for (const node of t.extensionASTNodes) {
      const hint = cacheAnnotationFromDirectives(node.directives);
      if (hint) {
        return hint;
      }
    }
  }
  return {};
}

function cacheAnnotationFromField(
  field: GraphQLField<unknown, unknown>,
): CacheAnnotation {
  if (field.astNode) {
    const hint = cacheAnnotationFromDirectives(field.astNode.directives);
    if (hint) {
      return hint;
    }
  }
  return {};
}

function isRestricted(hint: CacheHint) {
  return hint.maxAge !== undefined || hint.scope !== undefined;
}
