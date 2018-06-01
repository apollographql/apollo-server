import {
  GraphQLSchema,
  GraphQLFieldResolver,
  ExecutionResult,
  DocumentNode,
  parse,
  print,
  validate,
  execute,
  ExecutionArgs,
  getOperationAST,
  GraphQLError,
  specifiedRules,
  ValidationContext,
} from 'graphql';

import {
  enableGraphQLExtensions,
  GraphQLExtension,
  GraphQLExtensionStack,
  EndHandler,
} from 'graphql-extensions';
import { TracingExtension } from 'apollo-tracing';
import { CacheControlExtension } from 'apollo-cache-control';

import {
  fromGraphQLError,
  formatApolloErrors,
  ValidationError,
  SyntaxError,
} from './errors';

import { LogStep, LogAction, LogMessage, LogFunction } from './logging';
import { GraphQLRequest } from 'apollo-fetch';

export interface GraphQLResponse {
  data?: object;
  errors?: Array<GraphQLError & object>;
  extensions?: object;
}

export interface QueryOptions {
  schema: GraphQLSchema;
  // Specify exactly one of these. parsedQuery is primarily for use by
  // OperationStore.
  queryString?: string;
  parsedQuery?: DocumentNode;

  // If this is specified and the given GraphQL query is not a "query" (eg, it's
  // a mutation), throw this error.
  nonQueryError?: Error;

  rootValue?: any;
  context?: any;
  variables?: { [key: string]: any };
  operationName?: string;
  logFunction?: LogFunction;
  validationRules?: Array<(context: ValidationContext) => any>;
  fieldResolver?: GraphQLFieldResolver<any, any>;
  // WARNING: these extra validation rules are only applied to queries
  // submitted as string, not those submitted as Document!

  formatError?: Function;
  formatResponse?: Function;
  debug?: boolean;
  tracing?: boolean;
  // cacheControl?: boolean | CacheControlExtensionOptions;
  cacheControl?: boolean | any;
  request: Pick<Request, 'url' | 'method' | 'headers'>;
  extensions?: Array<() => GraphQLExtension>;
}

function isQueryOperation(query: DocumentNode, operationName: string) {
  const operationAST = getOperationAST(query, operationName);
  return operationAST.operation === 'query';
}

export function runQuery(options: QueryOptions): Promise<GraphQLResponse> {
  // Fiber-aware Promises run their .then callbacks in Fibers.
  return Promise.resolve().then(() => doRunQuery(options));
}

function doRunQuery(options: QueryOptions): Promise<GraphQLResponse> {
  if (options.queryString && options.parsedQuery) {
    throw new Error('Only supply one of queryString and parsedQuery');
  }
  if (!(options.queryString || options.parsedQuery)) {
    throw new Error('Must supply one of queryString and parsedQuery');
  }

  const logFunction =
    options.logFunction ||
    function() {
      return null;
    };
  const debugDefault =
    process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
  const debug = options.debug !== undefined ? options.debug : debugDefault;

  logFunction({ action: LogAction.request, step: LogStep.start });

  const context = options.context || {};

  // If custom extension factories were provided, create per-request extension objects.
  const extensions = options.extensions ? options.extensions.map(f => f()) : [];

  // Legacy hard-coded extension factories. The ApolloServer class doesn't use
  // this code path, but older APIs did.
  if (options.tracing) {
    extensions.push(new TracingExtension());
  }
  if (options.cacheControl === true) {
    extensions.push(new CacheControlExtension());
  } else if (options.cacheControl) {
    extensions.push(new CacheControlExtension(options.cacheControl));
  }

  const extensionStack = new GraphQLExtensionStack(extensions);

  // We unconditionally create an extensionStack (so that we don't have to
  // litter the rest of this function with `if (extensionStack)`, but we don't
  // instrument the schema unless there actually are extensions.
  if (extensions.length > 0) {
    context._extensionStack = extensionStack;
    enableGraphQLExtensions(options.schema);
  }

  const requestDidEnd = extensionStack.requestDidStart({
    // Since the Request interfacess are not the same between node-fetch and
    // typescript's lib dom, we should limit the fields that need to be passed
    // into requestDidStart to only the ones we need, currently just the
    // headers, method, and url
    request: options.request as any,
  });
  return Promise.resolve()
    .then(() => {
      const loggedQuery = options.queryString || print(options.parsedQuery);
      logFunction({
        action: LogAction.request,
        step: LogStep.status,
        key: 'query',
        data: loggedQuery,
      });
      logFunction({
        action: LogAction.request,
        step: LogStep.status,
        key: 'variables',
        data: options.variables,
      });
      logFunction({
        action: LogAction.request,
        step: LogStep.status,
        key: 'operationName',
        data: options.operationName,
      });

      // Parse the document.
      let documentAST: DocumentNode;
      if (options.parsedQuery) {
        documentAST = options.parsedQuery;
      } else if (!options.queryString) {
        throw new Error('Must supply one of queryString and parsedQuery');
      } else {
        logFunction({ action: LogAction.parse, step: LogStep.start });
        const parsingDidEnd = extensionStack.parsingDidStart({
          queryString: options.queryString,
        });
        let graphqlParseErrors;
        try {
          documentAST = parse(options.queryString);
        } catch (syntaxError) {
          graphqlParseErrors = formatApolloErrors(
            [
              fromGraphQLError(syntaxError, {
                errorClass: SyntaxError,
              }),
            ],
            {
              formatter: options.formatError,
              debug,
            },
          );
        } finally {
          parsingDidEnd(...(graphqlParseErrors || []));
          logFunction({ action: LogAction.parse, step: LogStep.end });
          if (graphqlParseErrors) {
            return Promise.resolve({ errors: graphqlParseErrors });
          }
        }
      }

      if (
        options.nonQueryError &&
        !isQueryOperation(documentAST, options.operationName)
      ) {
        // XXX this goes to requestDidEnd, is that correct or should it be
        // validation?
        throw options.nonQueryError;
      }

      let rules = specifiedRules;
      if (options.validationRules) {
        rules = rules.concat(options.validationRules);
      }
      logFunction({ action: LogAction.validation, step: LogStep.start });
      const validationDidEnd = extensionStack.validationDidStart();
      let validationErrors;
      try {
        validationErrors = validate(options.schema, documentAST, rules);
      } catch (validationThrewError) {
        // Catch errors thrown by validate, not just those returned by it.
        validationErrors = [validationThrewError];
      } finally {
        try {
          if (validationErrors) {
            validationErrors = formatApolloErrors(
              validationErrors.map(err =>
                fromGraphQLError(err, { errorClass: ValidationError }),
              ),
              {
                formatter: options.formatError,
                logFunction,
                debug,
              },
            );
          }
        } finally {
          validationDidEnd(...(validationErrors || []));
          logFunction({ action: LogAction.validation, step: LogStep.end });

          if (validationErrors && validationErrors.length) {
            return Promise.resolve({
              errors: validationErrors,
            });
          }
        }
      }

      const executionArgs: ExecutionArgs = {
        schema: options.schema,
        document: documentAST,
        rootValue: options.rootValue,
        contextValue: context,
        variableValues: options.variables,
        operationName: options.operationName,
        fieldResolver: options.fieldResolver,
      };
      logFunction({ action: LogAction.execute, step: LogStep.start });
      const executionDidEnd = extensionStack.executionDidStart({
        executionArgs,
      });
      return Promise.resolve()
        .then(() => execute(executionArgs))
        .catch(executionError => {
          return {
            // These errors will get passed through formatApolloErrors in the
            // `then` below.
            // TODO accurate code for this error, which describes this error, which
            // can occur when:
            // * variables incorrectly typed/null when nonnullable
            // * unknown operation/operation name invalid
            // * operation type is unsupported
            // Options: PREPROCESSING_FAILED, GRAPHQL_RUNTIME_CHECK_FAILED

            errors: [fromGraphQLError(executionError)],
          } as ExecutionResult;
        })
        .then(result => {
          let response: GraphQLResponse = {
            data: result.data,
          };

          if (result.errors) {
            response.errors = formatApolloErrors([...result.errors], {
              formatter: options.formatError,
              logFunction,
              debug,
            });
          }

          executionDidEnd(...result.errors);
          logFunction({ action: LogAction.execute, step: LogStep.end });

          const formattedExtensions = extensionStack.format();
          if (Object.keys(formattedExtensions).length > 0) {
            response.extensions = formattedExtensions;
          }

          if (options.formatResponse) {
            response = options.formatResponse(response, options);
          }

          return response;
        });
    })
    .catch(err => {
      // Handle the case of an internal server failure (or nonQueryError) ---
      // we're not returning a GraphQL response so we don't call
      // willSendResponse.
      requestDidEnd(err);
      logFunction({ action: LogAction.request, step: LogStep.end });
      throw err;
    })
    .then(graphqlResponse => {
      extensionStack.willSendResponse({ graphqlResponse });
      requestDidEnd();
      logFunction({
        action: LogAction.request,
        step: LogStep.end,
        key: 'response',
        data: graphqlResponse,
      });
      return graphqlResponse;
    });
}
