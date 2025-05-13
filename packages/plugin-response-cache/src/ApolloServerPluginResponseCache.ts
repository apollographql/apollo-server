import type { CacheHint } from '@apollo/cache-control-types';
import {
  type ApolloServerPlugin,
  type BaseContext,
  type GraphQLRequestContext,
  type GraphQLRequestListener,
  type GraphQLResponse,
  HeaderMap,
} from '@apollo/server';
import { createHash } from '@apollo/utils.createhash';
import {
  type KeyValueCache,
  PrefixingKeyValueCache,
} from '@apollo/utils.keyvaluecache';

export interface ApolloServerPluginResponseCacheOptions<
  TContext extends BaseContext,
> {
  // Underlying cache used to save results. All writes will be under keys that
  // start with 'fqc:' and are followed by a fixed-size cryptographic hash of a
  // JSON object with keys representing the query document, operation name,
  // variables, and other keys derived from the sessionId and extraCacheKeyData
  // hooks. If not provided, use the cache in the GraphQLRequestContext instead
  // (ie, the cache passed to the ApolloServer constructor).
  cache?: KeyValueCache;

  // Define this hook if you're setting any cache hints with scope PRIVATE. This
  // should return a session ID if the user is "logged in", or null if there is
  // no "logged in" user.
  //
  // If a cacheable response has any PRIVATE nodes, then:
  // - If this hook is not defined, a warning will be logged and it will not be
  //   cached.
  // - Else if this hook returns null, it will not be cached.
  // - Else it will be cached under a cache key tagged with the session ID and
  //   mode "private".
  //
  // If a cacheable response has no PRIVATE nodes, then:
  // - If this hook is not defined or returns null, it will be cached under a
  //   cache key tagged with the mode "no session".
  // - Else it will be cached under a cache key tagged with the mode
  //   "authenticated public".
  //
  // When reading from the cache:
  // - If this hook is not defined or returns null, look in the cache under a
  //   cache key tagged with the mode "no session".
  // - Else look in the cache under a cache key tagged with the session ID and
  //   the mode "private". If no response is found in the cache, then look under
  //   a cache key tagged with the mode "authenticated public".
  //
  // This allows the cache to provide different "public" results to anonymous
  // users and logged in users ("no session" vs "authenticated public").
  //
  // A common implementation of this hook would be to look in
  // requestContext.request.http.headers for a specific authentication header or
  // cookie.
  //
  // This hook may return a promise because, for example, you might need to
  // validate a cookie against an external service.
  //
  // Note: this hook has been updated in Apollo Server v4 to only return a
  // Promise. This function should always be `await`ed, that way non-TS users
  // won't experience a breakage (we can await Promises as well as values).
  sessionId?(
    requestContext: GraphQLRequestContext<TContext>,
  ): Promise<string | null>;

  // Define this hook if you want the cache key to vary based on some aspect of
  // the request other than the query document, operation name, variables, and
  // session ID. For example, responses that include translatable text may want
  // to return a string derived from
  // requestContext.request.http.headers.get('Accept-Language'). The data may
  // be anything that can be JSON-stringified.
  //
  // Note: this hook has been updated in Apollo Server v4 to only return a
  // Promise. This function should always be `await`ed, that way non-TS users
  // won't experience a breakage (we can await Promises as well as values).
  extraCacheKeyData?(
    requestContext: GraphQLRequestContext<TContext>,
  ): Promise<any>;

  // If this hook is defined and returns false, the plugin will not read
  // responses from the cache.
  //
  // Note: this hook has been updated in Apollo Server v4 to only return a
  // Promise. This function should always be `await`ed, that way non-TS users
  // won't experience a breakage (we can await Promises as well as values).
  shouldReadFromCache?(
    requestContext: GraphQLRequestContext<TContext>,
  ): Promise<boolean>;

  // If this hook is defined and returns false, the plugin will not write the
  // response to the cache.
  //
  // Note: this hook has been updated in Apollo Server v4 to only return a
  // Promise. This function should always be `await`ed, that way non-TS users
  // won't experience a breakage (we can await Promises as well as values).
  shouldWriteToCache?(
    requestContext: GraphQLRequestContext<TContext>,
  ): Promise<boolean>;

  // This hook allows one to replace the function that is used to create a cache
  // key. By default, it is the SHA-256 (from the Node `crypto` package) of the result of
  // calling `JSON.stringify(keyData)`. You can override this to customize the serialization
  // or the hash, or to make other changes like adding a prefix to keys to allow for
  // app-specific prefix-based cache invalidation. You may assume that `keyData` is an object
  // and that all relevant data will be found by the kind of iteration performed by
  // `JSON.stringify`, but you should not assume anything about the particular fields on
  // `keyData`.
  generateCacheKey?(
    requestContext: GraphQLRequestContext<Record<string, any>>,
    keyData: unknown,
  ): string;
}

enum SessionMode {
  NoSession,
  Private,
  AuthenticatedPublic,
}

function sha(s: string) {
  return createHash('sha256').update(s).digest('hex');
}

interface BaseCacheKeyData {
  source: string;
  operationName: string | null;
  variables: { [name: string]: any };
  extra: any;
}

interface ContextualCacheKeyData {
  sessionMode: SessionMode;
  sessionId?: string | null;
}

// We split the CacheKey type into two pieces just for convenience in the code
// below. Note that we don't actually export this type publicly (the
// generateCacheKey hook gets an `unknown` argument).
type CacheKeyData = BaseCacheKeyData & ContextualCacheKeyData;

type GenerateCacheKeyFunction = (
  requestContext: GraphQLRequestContext<Record<string, any>>,
  keyData: CacheKeyData,
) => string;

interface CacheValue {
  // Note: we only store data responses in the cache, not errors.
  //
  // There are two reasons we don't cache errors. The user-level reason is that
  // we think that in general errors are less cacheable than real results, since
  // they might indicate something transient like a failure to talk to a
  // backend. (If you need errors to be cacheable, represent the erroneous
  // condition explicitly in data instead of out-of-band as an error.) The
  // implementation reason is that this lets us avoid complexities around
  // serialization and deserialization of GraphQL errors, and the distinction
  // between formatted and unformatted errors, etc.
  data: Record<string, any>;
  cachePolicy: Required<CacheHint>;
  cacheTime: number; // epoch millis, used to calculate Age header
}

function isGraphQLQuery(requestContext: GraphQLRequestContext<any>) {
  return requestContext.operation?.operation === 'query';
}

export default function plugin<TContext extends BaseContext>(
  options: ApolloServerPluginResponseCacheOptions<TContext> = Object.create(
    null,
  ),
): ApolloServerPlugin<TContext> {
  return {
    async requestDidStart(
      outerRequestContext: GraphQLRequestContext<any>,
    ): Promise<GraphQLRequestListener<any>> {
      const cache = new PrefixingKeyValueCache(
        options.cache ?? outerRequestContext.cache,
        'fqc:',
      );

      const generateCacheKey: GenerateCacheKeyFunction =
        options.generateCacheKey ?? ((_, key) => sha(JSON.stringify(key)));

      let sessionId: string | null = null;
      let baseCacheKey: BaseCacheKeyData | null = null;
      let age: number | null = null;

      return {
        async responseForOperation(
          requestContext,
        ): Promise<GraphQLResponse | null> {
          requestContext.metrics.responseCacheHit = false;

          if (!isGraphQLQuery(requestContext)) {
            return null;
          }

          async function cacheGet(
            contextualCacheKeyFields: ContextualCacheKeyData,
          ): Promise<GraphQLResponse | null> {
            const cacheKeyData = {
              ...baseCacheKey!,
              ...contextualCacheKeyFields,
            };

            const key = generateCacheKey(requestContext, cacheKeyData);

            const serializedValue = await cache.get(key);
            if (serializedValue === undefined) {
              return null;
            }

            const value: CacheValue = JSON.parse(serializedValue);
            // Use cache policy from the cache (eg, to calculate HTTP response
            // headers).
            requestContext.overallCachePolicy.replace(value.cachePolicy);
            requestContext.metrics.responseCacheHit = true;
            age = Math.round((+new Date() - value.cacheTime) / 1000);
            return {
              body: { kind: 'single', singleResult: { data: value.data } },
              http: {
                status: undefined,
                headers: new HeaderMap(),
              },
            };
          }

          // Call hooks. Save values which will be used in willSendResponse as well.
          let extraCacheKeyData: any = null;
          if (options.sessionId) {
            sessionId = await options.sessionId(requestContext);
          }
          if (options.extraCacheKeyData) {
            extraCacheKeyData = await options.extraCacheKeyData(requestContext);
          }

          baseCacheKey = {
            source: requestContext.source!,
            operationName: requestContext.operationName,
            // Defensive copy just in case it somehow gets mutated.
            variables: { ...(requestContext.request.variables || {}) },
            extra: extraCacheKeyData,
          };

          // Note that we set up sessionId and baseCacheKey before doing this
          // check, so that we can still write the result to the cache even if
          // we are told not to read from the cache.
          if (options.shouldReadFromCache) {
            const shouldReadFromCache =
              await options.shouldReadFromCache(requestContext);
            if (!shouldReadFromCache) return null;
          }

          if (sessionId === null) {
            return cacheGet({ sessionMode: SessionMode.NoSession });
          } else {
            const privateResponse = await cacheGet({
              sessionId,
              sessionMode: SessionMode.Private,
            });
            if (privateResponse !== null) {
              return privateResponse;
            }
            return cacheGet({ sessionMode: SessionMode.AuthenticatedPublic });
          }
        },

        async willSendResponse(requestContext) {
          const logger = requestContext.logger || console;

          // We don't support caching incremental delivery responses (ie,
          // responses that use @defer or @stream) now. (It might be useful to
          // do so: after all, deferred responses might benefit the most from
          // caching! But we don't right now.)
          if (requestContext.response.body.kind !== 'single') {
            return;
          }

          if (!isGraphQLQuery(requestContext)) {
            return;
          }
          if (requestContext.metrics.responseCacheHit) {
            // Never write back to the cache what we just read from it. But do set the Age header!
            const http = requestContext.response.http;
            if (http && age !== null) {
              http.headers.set('age', age.toString());
            }
            return;
          }

          if (options.shouldWriteToCache) {
            const shouldWriteToCache =
              await options.shouldWriteToCache(requestContext);
            if (!shouldWriteToCache) return;
          }

          const { data, errors } = requestContext.response.body.singleResult;
          const policyIfCacheable =
            requestContext.overallCachePolicy.policyIfCacheable();
          if (errors || !data || !policyIfCacheable) {
            // This plugin never caches errors or anything without a cache policy.
            //
            // There are two reasons we don't cache errors. The user-level
            // reason is that we think that in general errors are less cacheable
            // than real results, since they might indicate something transient
            // like a failure to talk to a backend. (If you need errors to be
            // cacheable, represent the erroneous condition explicitly in data
            // instead of out-of-band as an error.) The implementation reason is
            // that this lets us avoid complexities around serialization and
            // deserialization of GraphQL errors, and the distinction between
            // formatted and unformatted errors, etc.
            return;
          }

          // We're pretty sure that any path that calls willSendResponse with a
          // non-error response will have already called our execute hook above,
          // but let's just double-check that, since accidentally ignoring
          // sessionId could be a big security hole.
          if (!baseCacheKey) {
            throw new Error(
              'willSendResponse called without error, but execute not called?',
            );
          }

          const cacheSetInBackground = (
            contextualCacheKeyFields: ContextualCacheKeyData,
          ): void => {
            const cacheKeyData = {
              ...baseCacheKey!,
              ...contextualCacheKeyFields,
            };

            const key = generateCacheKey(requestContext, cacheKeyData);

            const value: CacheValue = {
              data,
              cachePolicy: policyIfCacheable,
              cacheTime: +new Date(),
            };
            const serializedValue = JSON.stringify(value);
            // Note that this function converts key and response to strings before
            // doing anything asynchronous, so it can run in parallel with user code
            // without worrying about anything being mutated out from under it.
            //
            // Also note that the test suite assumes that this asynchronous function
            // still calls `cache.set` synchronously (ie, that it writes to
            // InMemoryLRUCache synchronously).
            cache
              .set(key, serializedValue, { ttl: policyIfCacheable.maxAge })
              .catch(logger.warn);
          };

          const isPrivate = policyIfCacheable.scope === 'PRIVATE';
          if (isPrivate) {
            if (!options.sessionId) {
              logger.warn(
                'A GraphQL response used @cacheControl or setCacheHint to set cache hints with scope ' +
                  "Private, but you didn't define the sessionId hook for " +
                  'apollo-server-plugin-response-cache. Not caching.',
              );
              return;
            }
            if (sessionId === null) {
              // Private data shouldn't be cached for logged-out users.
              return;
            }
            cacheSetInBackground({
              sessionId,
              sessionMode: SessionMode.Private,
            });
          } else {
            cacheSetInBackground({
              sessionMode:
                sessionId === null
                  ? SessionMode.NoSession
                  : SessionMode.AuthenticatedPublic,
            });
          }
        },
      };
    },
  };
}
