import {
  GraphQLSchema,
  GraphQLFieldResolver,
  specifiedRules,
  DocumentNode,
  getOperationAST,
  ExecutionArgs,
  ExecutionResult,
  GraphQLError,
} from 'graphql';
import * as graphql from 'graphql';
import {
  GraphQLExtension,
  GraphQLExtensionStack,
  enableGraphQLExtensions,
} from 'graphql-extensions';
import { DataSource } from 'apollo-datasource';
import { PersistedQueryOptions } from '.';
import {
  CacheControlExtension,
  CacheControlExtensionOptions,
} from 'apollo-cache-control';
import { TracingExtension } from 'apollo-tracing';
import {
  ApolloError,
  fromGraphQLError,
  SyntaxError,
  ValidationError,
  PersistedQueryNotSupportedError,
  PersistedQueryNotFoundError,
} from 'apollo-server-errors';
import { createHash } from 'crypto';
import {
  GraphQLRequest,
  GraphQLResponse,
  GraphQLRequestContext,
  InvalidGraphQLRequestError,
  ValidationRule,
} from '../dist/requestPipelineAPI';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  WithRequired,
} from 'apollo-server-plugin-base';

import { Dispatcher } from './utils/dispatcher';
import { InMemoryLRUCache, KeyValueCache } from 'apollo-server-caching';

export {
  GraphQLRequest,
  GraphQLResponse,
  GraphQLRequestContext,
  InvalidGraphQLRequestError,
};

function computeQueryHash(query: string) {
  return createHash('sha256')
    .update(query)
    .digest('hex');
}

export interface GraphQLRequestPipelineConfig<TContext> {
  schema: GraphQLSchema;

  rootValue?: ((document: DocumentNode) => any) | any;
  validationRules?: ValidationRule[];
  fieldResolver?: GraphQLFieldResolver<any, TContext>;

  dataSources?: () => DataSources<TContext>;

  extensions?: Array<() => GraphQLExtension>;
  tracing?: boolean;
  persistedQueries?: PersistedQueryOptions;
  cacheControl?: CacheControlExtensionOptions;

  formatError?: Function;
  formatResponse?: Function;

  plugins?: ApolloServerPlugin[];
  documentStore?: InMemoryLRUCache<DocumentNode>;
}

export type DataSources<TContext> = {
  [name: string]: DataSource<TContext>;
};

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export async function processGraphQLRequest<TContext>(
  config: GraphQLRequestPipelineConfig<TContext>,
  requestContext: Mutable<GraphQLRequestContext<TContext>>,
): Promise<GraphQLResponse> {
  let cacheControlExtension: CacheControlExtension | undefined;
  const extensionStack = initializeExtensionStack();
  (requestContext.context as any)._extensionStack = extensionStack;

  const dispatcher = initializeRequestListenerDispatcher();

  initializeDataSources();

  const request = requestContext.request;

  let { query, extensions } = request;

  let queryHash: string;

  let persistedQueryCache: KeyValueCache | undefined;
  let persistedQueryHit = false;
  let persistedQueryRegister = false;

  if (extensions && extensions.persistedQuery) {
    // It looks like we've received a persisted query. Check if we
    // support them.
    if (!config.persistedQueries || !config.persistedQueries.cache) {
      throw new PersistedQueryNotSupportedError();
    } else if (extensions.persistedQuery.version !== 1) {
      throw new InvalidGraphQLRequestError(
        'Unsupported persisted query version',
      );
    }

    // We'll store a reference to the persisted query cache so we can actually
    // do the write at a later point in the request pipeline processing.
    persistedQueryCache = config.persistedQueries.cache;

    queryHash = extensions.persistedQuery.sha256Hash;

    if (query === undefined) {
      query = await persistedQueryCache.get(`apq:${queryHash}`);
      if (query) {
        persistedQueryHit = true;
      } else {
        throw new PersistedQueryNotFoundError();
      }
    } else {
      const computedQueryHash = computeQueryHash(query);

      if (queryHash !== computedQueryHash) {
        throw new InvalidGraphQLRequestError(
          'provided sha does not match query',
        );
      }

      // We won't write to the persisted query cache until later.
      // Defering the writing gives plugins the ability to "win" from use of
      // the cache, but also have their say in whether or not the cache is
      // written to (by interrupting the request with an error).
      persistedQueryRegister = true;
    }
  } else if (query) {
    // FIXME: We'll compute the APQ query hash to use as our cache key for
    // now, but this should be replaced with the new operation ID algorithm.
    queryHash = computeQueryHash(query);
  } else {
    throw new InvalidGraphQLRequestError('Must provide query string.');
  }

  requestContext.queryHash = queryHash;

  const requestDidEnd = extensionStack.requestDidStart({
    request: request.http!,
    queryString: request.query,
    operationName: request.operationName,
    variables: request.variables,
    extensions: request.extensions,
    persistedQueryHit,
    persistedQueryRegister,
    context: requestContext.context,
    requestContext,
  });

  try {
    // If we're configured with a document store (by default, we are), we'll
    // utilize the operation's hash to lookup the AST from the previously
    // parsed-and-validated operation.  Failure to retrieve anything from the
    // cache just means we're committed to doing the parsing and validation.
    if (config.documentStore) {
      try {
        requestContext.document = await config.documentStore.get(queryHash);
      } catch (err) {
        console.warn(
          'An error occurred while attempting to read from the documentStore.',
          err,
        );
      }
    }

    // If we still don't have a document, we'll need to parse and validate it.
    // With success, we'll attempt to save it into the store for future use.
    if (!requestContext.document) {
      const parsingDidEnd = await dispatcher.invokeDidStartHook(
        'parsingDidStart',
        requestContext,
      );

      try {
        requestContext.document = parse(query);
        parsingDidEnd();
      } catch (syntaxError) {
        parsingDidEnd(syntaxError);
        return sendErrorResponse(syntaxError, SyntaxError);
      }

      const validationDidEnd = await dispatcher.invokeDidStartHook(
        'validationDidStart',
        requestContext as WithRequired<typeof requestContext, 'document'>,
      );

      const validationErrors = validate(requestContext.document);

      if (validationErrors.length === 0) {
        validationDidEnd();
      } else {
        validationDidEnd(validationErrors);
        return sendErrorResponse(validationErrors, ValidationError);
      }

      if (config.documentStore) {
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
          config.documentStore.set(queryHash, requestContext.document),
        ).catch(err =>
          console.warn('Could not store validated document.', err),
        );
      }
    }

    // FIXME: If we want to guarantee an operation has been set when invoking
    // `willExecuteOperation` and executionDidStart`, we need to throw an
    // error here and not leave this to `buildExecutionContext` in
    // `graphql-js`.
    const operation = getOperationAST(
      requestContext.document,
      request.operationName,
    );

    requestContext.operation = operation || undefined;
    // We'll set `operationName` to `null` for anonymous operations.
    requestContext.operationName =
      (operation && operation.name && operation.name.value) || null;

    await dispatcher.invokeHookAsync(
      'didResolveOperation',
      requestContext as WithRequired<
        typeof requestContext,
        'document' | 'operation' | 'operationName'
      >,
    );

    // Now that we've gone through the pre-execution phases of the request
    // pipeline, and given plugins appropriate ability to object (by throwing
    // an error) and not actually write, we'll write to the cache if it was
    // determined earlier in the request pipeline that we should do so.
    if (persistedQueryRegister && persistedQueryCache) {
      Promise.resolve(persistedQueryCache.set(`apq:${queryHash}`, query)).catch(
        console.warn,
      );
    }

    const executionDidEnd = await dispatcher.invokeDidStartHook(
      'executionDidStart',
      requestContext as WithRequired<
        typeof requestContext,
        'document' | 'operation' | 'operationName'
      >,
    );

    let response: GraphQLResponse;

    try {
      response = (await execute(
        requestContext.document,
        request.operationName,
        request.variables,
      )) as GraphQLResponse;
      executionDidEnd();
    } catch (executionError) {
      executionDidEnd(executionError);
      return sendErrorResponse(executionError);
    }

    const formattedExtensions = extensionStack.format();
    if (Object.keys(formattedExtensions).length > 0) {
      response.extensions = formattedExtensions;
    }

    if (config.formatResponse) {
      response = config.formatResponse(response, {
        context: requestContext.context,
      });
    }

    return sendResponse(response);
  } finally {
    requestDidEnd();
  }

  function parse(query: string): DocumentNode {
    const parsingDidEnd = extensionStack.parsingDidStart({
      queryString: query,
    });

    try {
      return graphql.parse(query);
    } finally {
      parsingDidEnd();
    }
  }

  function validate(document: DocumentNode): ReadonlyArray<GraphQLError> {
    let rules = specifiedRules;
    if (config.validationRules) {
      rules = rules.concat(config.validationRules);
    }

    const validationDidEnd = extensionStack.validationDidStart();

    try {
      return graphql.validate(config.schema, document, rules);
    } finally {
      validationDidEnd();
    }
  }

  async function execute(
    document: DocumentNode,
    operationName: GraphQLRequest['operationName'],
    variables: GraphQLRequest['variables'],
  ): Promise<ExecutionResult> {
    const executionArgs: ExecutionArgs = {
      schema: config.schema,
      document,
      rootValue:
        typeof config.rootValue === 'function'
          ? config.rootValue(document)
          : config.rootValue,
      contextValue: requestContext.context,
      variableValues: variables,
      operationName,
      fieldResolver: config.fieldResolver,
    };

    const executionDidEnd = extensionStack.executionDidStart({
      executionArgs,
    });

    try {
      return graphql.execute(executionArgs);
    } finally {
      executionDidEnd();
    }
  }

  async function sendResponse(
    response: GraphQLResponse,
  ): Promise<GraphQLResponse> {
    // We override errors, data, and extensions with the passed in response,
    // but keep other properties (like http)
    requestContext.response = extensionStack.willSendResponse({
      graphqlResponse: {
        ...requestContext.response,
        errors: response.errors,
        data: response.data,
        extensions: response.extensions,
      },
      context: requestContext.context,
    }).graphqlResponse;
    await dispatcher.invokeHookAsync(
      'willSendResponse',
      requestContext as WithRequired<typeof requestContext, 'response'>,
    );
    return requestContext.response!;
  }

  function sendErrorResponse(
    errorOrErrors: ReadonlyArray<GraphQLError> | GraphQLError,
    errorClass?: typeof ApolloError,
  ) {
    // If a single error is passed, it should still be encapsulated in an array.
    const errors = Array.isArray(errorOrErrors)
      ? errorOrErrors
      : [errorOrErrors];

    return sendResponse({
      errors: errors.map(err =>
        fromGraphQLError(
          err,
          errorClass && {
            errorClass,
          },
        ),
      ),
    });
  }

  function initializeRequestListenerDispatcher(): Dispatcher<
    GraphQLRequestListener
  > {
    const requestListeners: GraphQLRequestListener<TContext>[] = [];
    if (config.plugins) {
      for (const plugin of config.plugins) {
        if (!plugin.requestDidStart) continue;
        const listener = plugin.requestDidStart(requestContext);
        if (listener) {
          requestListeners.push(listener);
        }
      }
    }
    return new Dispatcher(requestListeners);
  }

  function initializeExtensionStack(): GraphQLExtensionStack<TContext> {
    enableGraphQLExtensions(config.schema);

    // If custom extension factories were provided, create per-request extension
    // objects.
    const extensions = config.extensions ? config.extensions.map(f => f()) : [];

    if (config.tracing) {
      extensions.push(new TracingExtension());
    }

    if (config.cacheControl) {
      cacheControlExtension = new CacheControlExtension(config.cacheControl);
      extensions.push(cacheControlExtension);
    }

    return new GraphQLExtensionStack(extensions);
  }

  function initializeDataSources() {
    if (config.dataSources) {
      const context = requestContext.context;

      const dataSources = config.dataSources();

      for (const dataSource of Object.values(dataSources)) {
        if (dataSource.initialize) {
          dataSource.initialize({
            context,
            cache: requestContext.cache,
          });
        }
      }

      if ('dataSources' in context) {
        throw new Error(
          'Please use the dataSources config option instead of putting dataSources on the context yourself.',
        );
      }

      (context as any).dataSources = dataSources;
    }
  }
}
