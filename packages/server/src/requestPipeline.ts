import { createHash } from '@apollo/utils.createhash';
import {
  specifiedRules,
  getOperationAST,
  GraphQLError,
  validate,
  parse,
  Kind,
  type ExecutionResult,
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
  GraphQLResponse,
  GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult,
} from './externalTypes/index.js';

import {
  invokeDidStartHook,
  invokeHooksUntilDefinedAndNonNull,
  invokeSyncDidStartHook,
} from './utils/invokeHooks.js';

import { makeGatewayGraphQLRequestContext } from './utils/makeGatewayGraphQLRequestContext.js';

import { mergeHTTPGraphQLHead, newHTTPGraphQLHead } from './runHttpQuery.js';
import type {
  ApolloServer,
  ApolloServerInternals,
  SchemaDerivedData,
} from './ApolloServer.js';
import { isDefined } from './utils/isDefined.js';
import type {
  GraphQLRequestContextDidEncounterSubsequentErrors,
  GraphQLRequestContextWillSendSubsequentPayload,
} from './externalTypes/requestPipeline.js';
import {
  executeIncrementally,
  type GraphQLExperimentalInitialIncrementalExecutionResult,
  type GraphQLExperimentalSubsequentIncrementalExecutionResult,
} from './incrementalDeliveryPolyfill.js';
import { HeaderMap } from './utils/HeaderMap.js';

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

// This is "semi-formatted" because the initial result has not yet been
// formatted but the subsequent results "have been" --- in the sense that they
// are an async iterable that will format them as they come in.
type SemiFormattedExecuteIncrementallyResults =
  | {
      singleResult: ExecutionResult;
    }
  | {
      initialResult: GraphQLExperimentalInitialIncrementalExecutionResult;
      subsequentResults: AsyncIterable<GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult>;
    };

export async function processGraphQLRequest<TContext extends BaseContext>(
  schemaDerivedData: SchemaDerivedData,
  server: ApolloServer<TContext>,
  internals: ApolloServerInternals<TContext>,
  requestContext: Mutable<GraphQLRequestContext<TContext>>,
): Promise<GraphQLResponse> {
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
      return await sendErrorResponse([new PersistedQueryNotSupportedError()]);
    } else if (extensions.persistedQuery.version !== 1) {
      return await sendErrorResponse([
        new GraphQLError('Unsupported persisted query version', {
          extensions: { http: newHTTPGraphQLHead(400) },
        }),
      ]);
    }

    queryHash = extensions.persistedQuery.sha256Hash;

    if (query === undefined) {
      query = await internals.persistedQueries.cache.get(queryHash);
      if (query) {
        requestContext.metrics.persistedQueryHit = true;
      } else {
        return await sendErrorResponse([new PersistedQueryNotFoundError()]);
      }
    } else {
      const computedQueryHash = computeQueryHash(query);

      // The provided hash must exactly match the SHA-256 hash of
      // the query string. This prevents hash hijacking, where a
      // new and potentially malicious query is associated with
      // an existing hash.
      if (queryHash !== computedQueryHash) {
        return await sendErrorResponse([
          new GraphQLError('provided sha does not match query', {
            extensions: { http: newHTTPGraphQLHead(400) },
          }),
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
        schemaDerivedData.documentStoreKeyPrefix + queryHash,
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

    if (internals.dangerouslyDisableValidation !== true) {
      const validationDidEnd = await invokeDidStartHook(
        requestListeners,
        async (l) =>
          l.validationDidStart?.(
            requestContext as GraphQLRequestContextValidationDidStart<TContext>,
          ),
      );

      let validationErrors = validate(
        schemaDerivedData.schema,
        requestContext.document,
        [...specifiedRules, ...internals.validationRules],
      );
      if (validationErrors.length === 0 && internals.laterValidationRules) {
        validationErrors = validate(
          schemaDerivedData.schema,
          requestContext.document,
          internals.laterValidationRules,
        );
      }

      if (validationErrors.length === 0) {
        await validationDidEnd();
      } else {
        await validationDidEnd(validationErrors);
        return await sendErrorResponse(
          validationErrors.map((error) => new ValidationError(error)),
        );
      }
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
        schemaDerivedData.documentStore.set(
          schemaDerivedData.documentStoreKeyPrefix + queryHash,
          requestContext.document,
        ),
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
    return await sendErrorResponse([
      new BadRequestError(
        `GET requests only support query operations, not ${operation.operation} operations`,
        {
          extensions: {
            http: { status: 405, headers: new HeaderMap([['allow', 'POST']]) },
          },
        },
      ),
    ]);
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
    // Note that we explicitly document throwing `GraphQLError`s from
    // `didResolveOperation` as a good way to do validation that depends on the
    // validated operation and the request context. (It will have status 500 by
    // default.)
    return await sendErrorResponse([ensureGraphQLError(err)]);
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
    requestContext.response.body = responseFromPlugin.body;
    mergeHTTPGraphQLHead(requestContext.response.http, responseFromPlugin.http);
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

    try {
      const fullResult = await execute(
        requestContext as GraphQLRequestContextExecutionDidStart<TContext>,
      );
      const result =
        'singleResult' in fullResult
          ? fullResult.singleResult
          : fullResult.initialResult;

      // If we don't have an operation, there's no reason to go further. We know
      // `result` will consist of one error (returned by `graphql-js`'s
      // `buildExecutionContext`).
      if (!requestContext.operation) {
        if (!result.errors?.length) {
          throw new Error(
            'Unexpected error: Apollo Server did not resolve an operation but execute did not return errors',
          );
        }
        throw new OperationResolutionError(result.errors[0]);
      }

      // The first thing that execution does is coerce the request's variables
      // to the types declared in the operation, which can lead to errors if
      // they are of the wrong type. It also makes sure that all non-null
      // variables are required and get non-null values. If any of these things
      // lead to errors, we change them into UserInputError so that their code
      // doesn't end up being INTERNAL_SERVER_ERROR, since these are client
      // errors. (But if the error already has a code, perhaps because the
      // original error was thrown from a custom scalar parseValue, we leave it
      // alone. We check that here instead of as part of
      // isBadUserInputGraphQLError since perhaps that function will one day be
      // changed to something we can get directly from graphql-js, but the
      // `code` check is AS-specific.)
      //
      // This is hacky! Hopefully graphql-js will give us a way to separate
      // variable resolution from execution later; see
      // https://github.com/graphql/graphql-js/issues/3169
      const resultErrors = result.errors?.map((e) => {
        if (isBadUserInputGraphQLError(e) && e.extensions?.code == null) {
          return new UserInputError(e);
        }
        return e;
      });

      if (resultErrors) {
        await didEncounterErrors(resultErrors);
      }

      const { formattedErrors, httpFromErrors } = resultErrors
        ? formatErrors(resultErrors)
        : { formattedErrors: undefined, httpFromErrors: newHTTPGraphQLHead() };

      // TODO(AS5) This becomes the default behavior and the
      // `status400ForVariableCoercionErrors` configuration option is removed /
      // ignored.
      if (
        internals.status400ForVariableCoercionErrors &&
        resultErrors?.length &&
        result.data === undefined &&
        !httpFromErrors.status
      ) {
        httpFromErrors.status = 400;
      }

      mergeHTTPGraphQLHead(requestContext.response.http, httpFromErrors);

      if ('singleResult' in fullResult) {
        requestContext.response.body = {
          kind: 'single',
          singleResult: {
            ...result,
            errors: formattedErrors,
          },
        };
      } else {
        requestContext.response.body = {
          kind: 'incremental',
          initialResult: {
            ...fullResult.initialResult,
            errors: formattedErrors,
          },
          subsequentResults: fullResult.subsequentResults,
        };
      }
    } catch (executionMaybeError: unknown) {
      const executionError = ensureError(executionMaybeError);
      await Promise.all(
        executionListeners.map((l) => l.executionDidEnd?.(executionError)),
      );

      return await sendErrorResponse([ensureGraphQLError(executionError)]);
    }

    await Promise.all(executionListeners.map((l) => l.executionDidEnd?.()));
  }

  await invokeWillSendResponse();
  if (!requestContext.response.body) {
    throw Error('got to end of processGraphQLRequest without setting body?');
  }
  return requestContext.response as GraphQLResponse; // cast checked on previous line

  async function execute(
    requestContext: GraphQLRequestContextExecutionDidStart<TContext>,
  ): Promise<SemiFormattedExecuteIncrementallyResults> {
    const { request, document } = requestContext;

    if (internals.__testing_incrementalExecutionResults) {
      return internals.__testing_incrementalExecutionResults;
    } else if (internals.gatewayExecutor) {
      const result = await internals.gatewayExecutor(
        makeGatewayGraphQLRequestContext(requestContext, server, internals),
      );
      return { singleResult: result };
    } else {
      const resultOrResults = await executeIncrementally({
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
      if ('initialResult' in resultOrResults) {
        return {
          initialResult: resultOrResults.initialResult,
          subsequentResults: formatErrorsInSubsequentResults(
            resultOrResults.subsequentResults,
          ),
        };
      } else {
        return { singleResult: resultOrResults };
      }
    }
  }

  async function* formatErrorsInSubsequentResults(
    results: AsyncIterable<GraphQLExperimentalSubsequentIncrementalExecutionResult>,
  ): AsyncIterable<GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult> {
    for await (const result of results) {
      const payload: GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult =
        result.incremental
          ? {
              ...result,
              incremental: await seriesAsyncMap(
                result.incremental,
                async (incrementalResult) => {
                  const { errors } = incrementalResult;
                  if (errors) {
                    await Promise.all(
                      requestListeners.map((l) =>
                        l.didEncounterSubsequentErrors?.(
                          requestContext as GraphQLRequestContextDidEncounterSubsequentErrors<TContext>,
                          errors,
                        ),
                      ),
                    );

                    return {
                      ...incrementalResult,
                      // Note that any `http` extensions in errors have no
                      // effect, because we've already sent the status code
                      // and response headers.
                      errors: formatErrors(errors).formattedErrors,
                    };
                  }
                  return incrementalResult;
                },
              ),
            }
          : result;

      // Invoke hook, which is allowed to mutate payload if it really wants to.
      await Promise.all(
        requestListeners.map((l) =>
          l.willSendSubsequentPayload?.(
            requestContext as GraphQLRequestContextWillSendSubsequentPayload<TContext>,
            payload,
          ),
        ),
      );

      yield payload;
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
  // If any errors have `extensions.http` set, it sets the response's status code
  // and errors from them.
  //
  // Then, if the HTTP status code is not yet set, it sets it to 500.
  async function sendErrorResponse(
    errors: ReadonlyArray<GraphQLError>,
  ): Promise<GraphQLResponse> {
    await didEncounterErrors(errors);

    const { formattedErrors, httpFromErrors } = formatErrors(errors);

    requestContext.response.body = {
      kind: 'single',
      singleResult: {
        errors: formattedErrors,
      },
    };

    mergeHTTPGraphQLHead(requestContext.response.http, httpFromErrors);

    if (!requestContext.response.http.status) {
      requestContext.response.http.status = 500;
    }

    await invokeWillSendResponse();

    // cast safe because we assigned to `body` above
    return requestContext.response as GraphQLResponse;
  }

  function formatErrors(
    errors: ReadonlyArray<GraphQLError>,
  ): ReturnType<typeof normalizeAndFormatErrors> {
    return normalizeAndFormatErrors(errors, {
      formatError: internals.formatError,
      includeStacktraceInErrorResponses:
        internals.includeStacktraceInErrorResponses,
    });
  }
}

async function seriesAsyncMap<T, U>(
  ts: readonly T[],
  fn: (value: T) => Promise<U>,
): Promise<U[]> {
  const us: U[] = [];
  for (const t of ts) {
    const u = await fn(t);
    us.push(u);
  }
  return us;
}
