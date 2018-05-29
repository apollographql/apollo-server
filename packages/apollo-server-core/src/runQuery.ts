import {
  GraphQLSchema,
  GraphQLFieldResolver,
  ExecutionResult,
  DocumentNode,
  parse,
  print,
  validate,
  execute,
  getOperationAST,
  GraphQLError,
  specifiedRules,
  ValidationContext,
} from 'graphql';

import {
  enableGraphQLExtensions,
  GraphQLExtension,
  GraphQLExtensionStack,
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
  request: Request;
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
  let documentAST: DocumentNode;

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
  let extensions = [];
  if (options.tracing) {
    extensions.push(TracingExtension);
  }
  if (options.cacheControl === true) {
    extensions.push(CacheControlExtension);
  } else if (options.cacheControl) {
    extensions.push(new CacheControlExtension(options.cacheControl));
  }
  const extensionStack =
    extensions.length > 0 && new GraphQLExtensionStack(extensions);

  if (extensionStack) {
    context._extensionStack = extensionStack;
    enableGraphQLExtensions(options.schema);

    extensionStack.requestDidStart();
  }

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

  // Parse and validate the query, unless it is already an AST (eg, if using
  // OperationStore with formatParams).
  if (options.queryString) {
    try {
      logFunction({ action: LogAction.parse, step: LogStep.start });
      documentAST = parse(options.queryString);
      logFunction({ action: LogAction.parse, step: LogStep.end });
    } catch (syntaxError) {
      logFunction({ action: LogAction.parse, step: LogStep.end });
      return Promise.resolve({
        errors: formatApolloErrors(
          [
            fromGraphQLError(syntaxError, {
              errorClass: SyntaxError,
            }),
          ],
          {
            formatter: options.formatError,
            debug,
          },
        ),
      });
    }
  } else {
    documentAST = options.parsedQuery;
  }

  if (
    options.nonQueryError &&
    !isQueryOperation(documentAST, options.operationName)
  ) {
    throw options.nonQueryError;
  }

  let rules = specifiedRules;
  if (options.validationRules) {
    rules = rules.concat(options.validationRules);
  }
  logFunction({ action: LogAction.validation, step: LogStep.start });
  const validationErrors = validate(options.schema, documentAST, rules);
  logFunction({ action: LogAction.validation, step: LogStep.end });

  if (validationErrors.length) {
    return Promise.resolve({
      errors: formatApolloErrors(
        validationErrors.map(err =>
          fromGraphQLError(err, { errorClass: ValidationError }),
        ),
        {
          formatter: options.formatError,
          logFunction,
          debug,
        },
      ),
    });
  }

  if (extensionStack) {
    extensionStack.executionDidStart();
  }

  try {
    logFunction({ action: LogAction.execute, step: LogStep.start });
    return Promise.resolve(
      execute(
        options.schema,
        documentAST,
        options.rootValue,
        context,
        options.variables,
        options.operationName,
        options.fieldResolver,
      ),
    ).then(result => {
      logFunction({ action: LogAction.execute, step: LogStep.end });

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

      if (extensionStack) {
        extensionStack.executionDidEnd();
        extensionStack.requestDidEnd();
        response.extensions = extensionStack.format();
      }

      if (options.formatResponse) {
        response = options.formatResponse(response, options);
      }

      logFunction({
        action: LogAction.request,
        step: LogStep.end,
        key: 'response',
        data: response,
      });

      return response;
    });
  } catch (executionError) {
    logFunction({ action: LogAction.execute, step: LogStep.end });
    logFunction({ action: LogAction.request, step: LogStep.end });
    return Promise.resolve({
      //TODO accurate code for this error, which describes this error, which
      // can occur when:
      // * variables incorrectly typed/null when nonnullable
      // * unknown operation/operation name invalid
      // * operation type is unsupported
      // Options: PREPROCESSING_FAILED, GRAPHQL_RUNTIME_CHECK_FAILED
      errors: formatApolloErrors([fromGraphQLError(executionError)], {
        formatter: options.formatError,
        debug,
      }),
    });
  }
}
