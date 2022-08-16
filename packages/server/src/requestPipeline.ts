import { createHash } from '@apollo/utils.createhash';
import {
  specifiedRules,
  getOperationAST,
  GraphQLError,
  GraphQLFormattedError,
  validate,
  parse,
  execute as graphqlExecute,
  Kind,
  ExecutionResult,
} from 'graphql';
import {
  symbolExecutionDispatcherWillResolveField,
  enablePluginsForSchemaResolvers,
  symbolUserFieldResolver,
} from './utils/schemaInstrumentation.js';
import {
  PersistedQueryNotSupportedError,
  PersistedQueryNotFoundError,
  UserInputError,
  BadRequestError,
  ValidationError,
  SyntaxError,
  OperationResolutionError,
} from './internalErrorClasses.js';
import {
  ensureError,
  normalizeAndFormatErrors,
  ensureGraphQLError,
} from './errorNormalize.js';
import type {
  GraphQLRequestContext,
  GraphQLRequestContextDidResolveSource,
  GraphQLRequestContextExecutionDidStart,
  GraphQLRequestContextResponseForOperation,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextParsingDidStart,
  GraphQLRequestContextValidationDidStart,
  GraphQLRequestContextWillSendResponse,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestExecutionListener,
  BaseContext,
  HTTPGraphQLHead,
} from './externalTypes';

import {
  invokeDidStartHook,
  invokeHooksUntilDefinedAndNonNull,
  invokeSyncDidStartHook,
} from './utils/invokeHooks.js';

import { makeGatewayGraphQLRequestContext } from './utils/makeGatewayGraphQLRequestContext.js';

import { HeaderMap, newHTTPGraphQLHead } from './runHttpQuery.js';
import type {
  ApolloServer,
  ApolloServerInternals,
  SchemaDerivedData,
} from './ApolloServer';
import { isDefined } from './utils/isDefined.js';

export const APQ_CACHE_PREFIX = 'apq:';

function computeQueryHash(query: string) {
  return createHash('sha256').update(query).digest('hex');
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

function isBadUserInputGraphQLError(error: GraphQLError): boolean {
  return (
    error.nodes?.length === 1 &&
    error.nodes[0].kind === Kind.VARIABLE_DEFINITION &&
    (error.message.startsWith(
      `Variable "$${error.nodes[0].variable.name.value}" got invalid value `,
    ) ||
      error.message.startsWith(
        `Variable "$${error.nodes[0].variable.name.value}" of required type `,
      ) ||
      error.message.startsWith(
        `Variable "$${error.nodes[0].variable.name.value}" of non-null type `,
      ))
  );
}

// Persisted query errors (especially "not found") need to be uncached, because
// hopefully we're about to fill in the APQ cache and the same request will
// succeed next time. We also want a 200 response to avoid any error handling
// that may mask the contents of an error response. (Otherwise, the default
// status code for a response with `errors` but no `data` (even null) is 400.)
const getPersistedQueryErrorHttp = () => ({
  status: 200,
  headers: new HeaderMap([
    ['cache-control', 'private, no-cache, must-revalidate'],
  ]),
});

export async function processGraphQLRequest<TContext extends BaseContext>(
  schemaDerivedData: SchemaDerivedData,
  server: ApolloServer<TContext>,
  internals: ApolloServerInternals<TContext>,
  requestContext: Mutable<GraphQLRequestContext<TContext>>,
) {
  const requestListeners = (
    await Promise.all(
      internals.plugins.map((p) => p.requestDidStart?.(requestContext)),
    )
  ).filter(isDefined);

  const request = requestContext.request;

  let { query, extensions } = request;

  let queryHash: string;

  requestContext.metrics.persistedQueryHit = false;
  requestContext.metrics.persistedQueryRegister = false;

  if (extensions?.persistedQuery) {
    // It looks like we've received a persisted query. Check if we
    // support them.
    if (!internals.persistedQueries) {
      return await sendErrorResponse(
        [new PersistedQueryNotSupportedError()],
        // Not super clear why we need this to be uncached (makes sense for
        // PersistedQueryNotFoundError, because there we're about to fill the
        // cache and make the next copy of the same request succeed) but we've
        // been doing it for years so :shrug:
        getPersistedQueryErrorHttp(),
      );
    } else if (extensions.persistedQuery.version !== 1) {
      return await sendErrorResponse([
        new GraphQLError('Unsupported persisted query version'),
      ]);
    }

    queryHash = extensions.persistedQuery.sha256Hash;

    if (query === undefined) {
      query = await internals.persistedQueries.cache.get(queryHash);
      if (query) {
        requestContext.metrics.persistedQueryHit = true;
      } else {
        return await sendErrorResponse(
          [new PersistedQueryNotFoundError()],
          getPersistedQueryErrorHttp(),
        );
      }
    } else {
      const computedQueryHash = computeQueryHash(query);

      // The provided hash must exactly match the SHA-256 hash of
      // the query string. This prevents hash hijacking, where a
      // new and potentially malicious query is associated with
      // an existing hash.
      if (queryHash !== computedQueryHash) {
        return await sendErrorResponse([
          new GraphQLError('provided sha does not match query'),
        ]);
      }

      // We won't write to the persisted query cache until later.
      // Deferring the writing gives plugins the ability to "win" from use of
      // the cache, but also have their say in whether or not the cache is
      // written to (by interrupting the request with an error).
      requestContext.metrics.persistedQueryRegister = true;
    }
  } else if (query) {
    queryHash = computeQueryHash(query);
  } else {
    return await sendErrorResponse([
      new BadRequestError(
        'GraphQL operations must contain a non-empty `query` or a `persistedQuery` extension.',
      ),
    ]);
  }

  requestContext.queryHash = queryHash;
  requestContext.source = query;

  // Let the plugins know that we now have a STRING of what we hope will
  // parse and validate into a document we can execute on.  Unless we have
  // retrieved this from our APQ cache, there's no guarantee that it is
  // syntactically correct, so this string should not be trusted as a valid
  // document until after it's parsed and validated.
  await Promise.all(
    requestListeners.map((l) =>
      l.didResolveSource?.(
        requestContext as GraphQLRequestContextDidResolveSource<TContext>,
      ),
    ),
  );

  // If we're configured with a document store (by default, we are), we'll
  // utilize the operation's hash to lookup the AST from the previously
  // parsed-and-validated operation.  Failure to retrieve anything from the
  // cache just means we're committed to doing the parsing and validation.
  if (schemaDerivedData.documentStore) {
    try {
      requestContext.document = await schemaDerivedData.documentStore.get(
        queryHash,
      );
    } catch (err: unknown) {
      server.logger.warn(
        'An error occurred while attempting to read from the documentStore. ' +
          ensureError(err).message,
      );
    }
  }

  // If we still don't have a document, we'll need to parse and validate it.
  // With success, we'll attempt to save it into the store for future use.
  if (!requestContext.document) {
    const parsingDidEnd = await invokeDidStartHook(
      requestListeners,
      async (l) =>
        l.parsingDidStart?.(
          requestContext as GraphQLRequestContextParsingDidStart<TContext>,
        ),
    );

    try {
      requestContext.document = parse(query, internals.parseOptions);
    } catch (syntaxMaybeError: unknown) {
      const error = ensureError(syntaxMaybeError);
      await parsingDidEnd(error);
      return await sendErrorResponse([
        new SyntaxError(ensureGraphQLError(error)),
      ]);
    }
    await parsingDidEnd();

    const validationDidEnd = await invokeDidStartHook(
      requestListeners,
      async (l) =>
        l.validationDidStart?.(
          requestContext as GraphQLRequestContextValidationDidStart<TContext>,
        ),
    );

    const validationErrors = validate(
      schemaDerivedData.schema,
      requestContext.document,
      [...specifiedRules, ...internals.validationRules],
    );

    if (validationErrors.length === 0) {
      await validationDidEnd();
    } else {
      await validationDidEnd(validationErrors);
      return await sendErrorResponse(
        validationErrors.map((error) => new ValidationError(error)),
      );
    }

    if (schemaDerivedData.documentStore) {
      // The underlying cache store behind the `documentStore` returns a
      // `Promise` which is resolved (or rejected), eventually, based on the
      // success or failure (respectively) of the cache save attempt.  While
      // it's certainly possible to `await` this `Promise`, we don't care about
      // whether or not it's successful at this point.  We'll instead proceed
      // to serve the rest of the request and just hope that this works out.
      // If it doesn't work, the next request will have another opportunity to
      // try again.  Errors will surface as warnings, as appropriate.
      //
      // While it shouldn't normally be necessary to wrap this `Promise` in a
      // `Promise.resolve` invocation, it seems that the underlying cache store
      // is returning a non-native `Promise` (e.g. Bluebird, etc.).
      Promise.resolve(
        schemaDerivedData.documentStore.set(queryHash, requestContext.document),
      ).catch((err) =>
        server.logger.warn(
          'Could not store validated document. ' + err?.message || err,
        ),
      );
    }
  }

  // TODO: If we want to guarantee an operation has been set when invoking
  // `willExecuteOperation` and executionDidStart`, we need to throw an
  // error here and not leave this to `buildExecutionContext` in
  // `graphql-js`.
  const operation = getOperationAST(
    requestContext.document,
    request.operationName,
  );

  requestContext.operation = operation || undefined;
  // We'll set `operationName` to `null` for anonymous operations.
  requestContext.operationName = operation?.name?.value || null;

  // Special case: GET operations should only be queries (not mutations). We
  // want to throw a particular HTTP error in that case. (This matters because
  // it's generally how HTTP requests should work, and additionally it makes us
  // less vulnerable to mutations running over CSRF, if you turn off our CSRF
  // prevention feature.)
  if (
    request.http?.method === 'GET' &&
    operation?.operation &&
    operation.operation !== 'query'
  ) {
    return await sendErrorResponse(
      [
        new BadRequestError(
          `GET requests only support query operations, not ${operation.operation} operations`,
        ),
      ],
      { status: 405, headers: new HeaderMap([['allow', 'POST']]) },
    );
  }

  try {
    await Promise.all(
      requestListeners.map((l) =>
        l.didResolveOperation?.(
          requestContext as GraphQLRequestContextDidResolveOperation<TContext>,
        ),
      ),
    );
  } catch (err: unknown) {
    return await sendErrorResponse(
      [ensureGraphQLError(err)],
      newHTTPGraphQLHead(500),
    );
  }

  // Now that we've gone through the pre-execution phases of the request
  // pipeline, and given plugins appropriate ability to object (by throwing
  // an error) and not actually write, we'll write to the cache if it was
  // determined earlier in the request pipeline that we should do so.
  if (
    requestContext.metrics.persistedQueryRegister &&
    internals.persistedQueries
  ) {
    // While it shouldn't normally be necessary to wrap this `Promise` in a
    // `Promise.resolve` invocation, it seems that the underlying cache store
    // is returning a non-native `Promise` (e.g. Bluebird, etc.).
    const ttl = internals.persistedQueries?.ttl;
    Promise.resolve(
      internals.persistedQueries.cache.set(
        queryHash,
        query,
        // Explicitly checking for `undefined` which means "not set" vs 0 or
        // null which means "no TTL".
        ttl !== undefined
          ? { ttl: internals.persistedQueries?.ttl }
          : undefined,
      ),
    ).catch(server.logger.warn);
  }

  const responseFromPlugin = await invokeHooksUntilDefinedAndNonNull(
    requestListeners,
    async (l) =>
      await l.responseForOperation?.(
        requestContext as GraphQLRequestContextResponseForOperation<TContext>,
      ),
  );
  if (responseFromPlugin !== null) {
    requestContext.response.result = responseFromPlugin.result;
    updateResponseHTTP(responseFromPlugin.http);
  } else {
    const executionListeners = (
      await Promise.all(
        requestListeners.map((l) =>
          l.executionDidStart?.(
            requestContext as GraphQLRequestContextExecutionDidStart<TContext>,
          ),
        ),
      )
    ).filter(isDefined);
    executionListeners.reverse();

    if (executionListeners.some((l) => l.willResolveField)) {
      // Create a callback that will trigger the execution dispatcher's
      // `willResolveField` hook.  We will attach this to the context on a
      // symbol so it can be invoked by our `wrapField` method during execution.
      const invokeWillResolveField: GraphQLRequestExecutionListener<TContext>['willResolveField'] =
        (...args) =>
          invokeSyncDidStartHook(executionListeners, (l) =>
            l.willResolveField?.(...args),
          );

      Object.defineProperty(
        requestContext.contextValue,
        symbolExecutionDispatcherWillResolveField,
        { value: invokeWillResolveField },
      );

      // If the user has provided a custom field resolver, we will attach
      // it to the context so we can still invoke it after we've wrapped the
      // fields with `wrapField` within `enablePluginsForSchemaResolvers` of
      // the `schemaInstrumentation` module.
      if (internals.fieldResolver) {
        Object.defineProperty(
          requestContext.contextValue,
          symbolUserFieldResolver,
          {
            value: internals.fieldResolver,
          },
        );
      }

      // If the schema is already enabled, this is a no-op.  Otherwise, the
      // schema will be augmented so it is able to invoke willResolveField. Note
      // that if we never see a plugin with willResolveField then we will never
      // need to instrument the schema, which might be a small performance gain.
      // (For example, this can happen if you pass `fieldLevelInstrumentation:
      // () => false` to the usage reporting plugin and disable the cache
      // control plugin. We can consider changing the cache control plugin to
      // have a "static cache control only" mode that doesn't use
      // willResolveField too if this proves to be helpful in practice.)
      enablePluginsForSchemaResolvers(schemaDerivedData.schema);
    }

    let statusIfExecuteThrows = 500;
    try {
      const result = await execute(
        requestContext as GraphQLRequestContextExecutionDidStart<TContext>,
      );

      // If we don't have an operation, there's no reason to go further. We know
      // `result` will consist of one error (returned by `graphql-js`'s
      // `buildExecutionContext`).
      if (!requestContext.operation) {
        if (!result.errors?.length) {
          throw new Error(
            'Unexpected error: Apollo Server did not resolve an operation but execute did not return errors',
          );
        }
        statusIfExecuteThrows = 400;
        throw new OperationResolutionError(result.errors[0]);
      }

      // The first thing that execution does is coerce the request's variables
      // to the types declared in the operation, which can lead to errors if
      // they are of the wrong type. It also makes sure that all non-null
      // variables are required and get non-null values. If any of these things
      // lead to errors, we change them into UserInputError so that their code
      // doesn't end up being INTERNAL_SERVER_ERROR, since these are client
      // errors.
      //
      // This is hacky! Hopefully graphql-js will give us a way to separate
      // variable resolution from execution later; see
      // https://github.com/graphql/graphql-js/issues/3169
      const resultErrors = result.errors?.map((e) => {
        if (isBadUserInputGraphQLError(e)) {
          return new UserInputError(e);
        }
        return e;
      });

      if (resultErrors) {
        await didEncounterErrors(resultErrors);
      }

      requestContext.response.result = {
        ...result,
        errors: resultErrors ? formatErrors(resultErrors) : undefined,
      };

      await Promise.all(executionListeners.map((l) => l.executionDidEnd?.()));
    } catch (executionMaybeError: unknown) {
      const executionError = ensureError(executionMaybeError);
      await Promise.all(
        executionListeners.map((l) => l.executionDidEnd?.(executionError)),
      );

      return await sendErrorResponse(
        [ensureGraphQLError(executionError)],
        newHTTPGraphQLHead(statusIfExecuteThrows),
      );
    }
  }

  await invokeWillSendResponse();
  return;

  async function execute(
    requestContext: GraphQLRequestContextExecutionDidStart<TContext>,
  ): Promise<ExecutionResult> {
    const { request, document } = requestContext;

    if (internals.gatewayExecutor) {
      const result = await internals.gatewayExecutor(
        makeGatewayGraphQLRequestContext(requestContext, server, internals),
      );
      return result;
    } else {
      return await graphqlExecute({
        schema: schemaDerivedData.schema,
        document,
        rootValue:
          typeof internals.rootValue === 'function'
            ? internals.rootValue(document)
            : internals.rootValue,
        contextValue: requestContext.contextValue,
        variableValues: request.variables,
        operationName: request.operationName,
        fieldResolver: internals.fieldResolver,
      });
    }
  }

  function updateResponseHTTP(http: HTTPGraphQLHead) {
    if (http.status) {
      requestContext.response.http.status = http.status;
    }
    for (const [name, value] of http.headers) {
      // TODO(AS4): this is overwriting rather than appending. However we should
      // probably be able to eliminate this whole block if we refactor GraphQLResponse.
      requestContext.response.http.headers.set(name, value);
    }
  }

  async function invokeWillSendResponse() {
    await Promise.all(
      requestListeners.map((l) =>
        l.willSendResponse?.(
          requestContext as GraphQLRequestContextWillSendResponse<TContext>,
        ),
      ),
    );
  }

  // Note that we ensure that all calls to didEncounterErrors are followed by
  // calls to willSendResponse. (The usage reporting plugin depends on this.)
  async function didEncounterErrors(errors: ReadonlyArray<GraphQLError>) {
    requestContext.errors = errors;

    return await Promise.all(
      requestListeners.map((l) =>
        l.didEncounterErrors?.(
          requestContext as GraphQLRequestContextDidEncounterErrors<TContext>,
        ),
      ),
    );
  }

  // This function "sends" a response that contains errors and no data (not even
  // `data: null`) because the pipeline does not make it to a successful
  // `execute` call. (It is *not* called for execution that happens to return
  // some errors.) In this case "send" means "update requestContext.response and
  // invoke willSendResponse hooks".
  //
  // If `http` is provided, it sets its status code and headers if given.
  //
  // Then, if the HTTP status code is not yet set, it sets it to 400.
  async function sendErrorResponse(
    errors: ReadonlyArray<GraphQLError>,
    http: HTTPGraphQLHead = newHTTPGraphQLHead(),
  ) {
    await didEncounterErrors(errors);

    requestContext.response.result = {
      errors: formatErrors(errors),
    };

    updateResponseHTTP(http);

    if (!requestContext.response.http.status) {
      requestContext.response.http.status = 400;
    }

    await invokeWillSendResponse();
  }

  function formatErrors(
    errors: ReadonlyArray<GraphQLError>,
  ): ReadonlyArray<GraphQLFormattedError> {
    return normalizeAndFormatErrors(errors, {
      formatError: internals.formatError,
      includeStacktraceInErrorResponses:
        internals.includeStacktraceInErrorResponses,
    });
  }
}
