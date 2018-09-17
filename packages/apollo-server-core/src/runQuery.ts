import {
  GraphQLSchema,
  GraphQLFieldResolver,
  ExecutionResult,
  DocumentNode,
  parse,
  validate,
  execute,
  ExecutionArgs,
  GraphQLError,
  specifiedRules,
  ValidationContext,
} from 'graphql';

import { Request } from 'apollo-server-env';

import {
  enableGraphQLExtensions,
  GraphQLExtension,
  GraphQLExtensionStack,
} from 'graphql-extensions';
import { TracingExtension } from 'apollo-tracing';
import {
  CacheControlExtension,
  CacheControlExtensionOptions,
} from 'apollo-cache-control';

import {
  fromGraphQLError,
  formatApolloErrors,
  ValidationError,
  SyntaxError,
} from 'apollo-server-errors';

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

  rootValue?: any;
  context?: any;
  variables?: { [key: string]: any };
  operationName?: string;
  validationRules?: Array<(context: ValidationContext) => any>;
  fieldResolver?: GraphQLFieldResolver<any, any>;
  // WARNING: these extra validation rules are only applied to queries
  // submitted as string, not those submitted as Document!

  formatError?: Function;
  formatResponse?: Function;
  debug?: boolean;
  tracing?: boolean;
  cacheControl?: boolean | CacheControlExtensionOptions;
  request: Pick<Request, 'url' | 'method' | 'headers'>;
  extensions?: Array<() => GraphQLExtension>;
  persistedQueryHit?: boolean;
  persistedQueryRegister?: boolean;
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

  const debugDefault =
    process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
  const debug = options.debug !== undefined ? options.debug : debugDefault;

  const context = options.context || {};

  // If custom extension factories were provided, create per-request extension
  // objects.
  const extensions = options.extensions ? options.extensions.map(f => f()) : [];

  // If you're running behind an engineproxy, set these options to turn on
  // tracing and cache-control extensions.
  if (options.tracing) {
    extensions.push(new TracingExtension());
  }
  if (options.cacheControl === true) {
    extensions.push(new CacheControlExtension());
  } else if (options.cacheControl) {
    extensions.push(new CacheControlExtension(options.cacheControl));
  }

  const extensionStack = new GraphQLExtensionStack(extensions);

  // We unconditionally create an extensionStack, even if there are no
  // extensions (so that we don't have to litter the rest of this function with
  // `if (extensionStack)`, but we don't instrument the schema unless there
  // actually are extensions.  We do unconditionally put the stack on the
  // context, because if some other call had extensions and the schema is
  // already instrumented, that's the only way to get a custom fieldResolver to
  // work.
  if (extensions.length > 0) {
    enableGraphQLExtensions(options.schema);
  }
  context._extensionStack = extensionStack;

  const requestDidEnd = extensionStack.requestDidStart({
    // Since the Request interfacess are not the same between node-fetch and
    // typescript's lib dom, we should limit the fields that need to be passed
    // into requestDidStart to only the ones we need, currently just the
    // headers, method, and url
    request: options.request as any,
    queryString: options.queryString,
    parsedQuery: options.parsedQuery,
    operationName: options.operationName,
    variables: options.variables,
    persistedQueryHit: options.persistedQueryHit,
    persistedQueryRegister: options.persistedQueryRegister,
    context,
  });

  return Promise.resolve()
    .then(
      (): Promise<GraphQLResponse> => {
        // Parse the document.
        let documentAST: DocumentNode;
        try {
          documentAST = doParse({
            parsedQuery: options.parsedQuery,
            queryString: options.queryString,
            extensionStack,
          });
        } catch (syntaxError) {
          return Promise.resolve({
            errors: formatApolloErrors(
              [
                fromGraphQLError(syntaxError, {
                  errorClass: SyntaxError,
                }),
              ],
              {
                debug,
              },
            ),
          });
        }

        let rules = specifiedRules;
        if (options.validationRules) {
          rules = rules.concat(options.validationRules);
        }

        const validationErrors = doValidation({
          extensionStack,
          schema: options.schema,
          documentAST,
          rules,
          debug,
        });
        if (validationErrors) {
          return validationErrors;
        }

        return doExecution({
          schema: options.schema,
          document: documentAST,
          rootValue: options.rootValue,
          contextValue: context,
          variableValues: options.variables,
          operationName: options.operationName,
          fieldResolver: options.fieldResolver,
          extensionStack,
          debug,
          options,
        });
      },
    )
    .catch((err: Error) => {
      // Handle the case of an internal server failure ---
      // we're not returning a GraphQL response so we don't call
      // willSendResponse.
      requestDidEnd(err);
      throw err;
    })
    .then((graphqlResponse: GraphQLResponse) => {
      const response = extensionStack.willSendResponse({
        graphqlResponse,
        context,
      });
      requestDidEnd();
      return response.graphqlResponse;
    });
}

interface ParseArgs {
  extensionStack: GraphQLExtensionStack<any>;
  queryString?: string;
  parsedQuery?: DocumentNode;
}

function doParse({
  parsedQuery,
  queryString,
  extensionStack,
}: ParseArgs): DocumentNode {
  if (parsedQuery) {
    return parsedQuery;
  } else if (!queryString) {
    throw new Error('Must supply one of queryString and parsedQuery');
  } else {
    const parsingDidEnd = extensionStack.parsingDidStart({
      queryString,
    });
    let graphqlParseErrors: SyntaxError[] | undefined;
    try {
      return parse(queryString);
    } finally {
      parsingDidEnd(...(graphqlParseErrors || []));
    }
  }
}

interface ValidationArgs {
  extensionStack: GraphQLExtensionStack<any>;
  schema: GraphQLSchema;
  documentAST: DocumentNode;
  rules: ((context: ValidationContext) => any)[];
  debug: boolean;
}

function doValidation({
  extensionStack,
  schema,
  documentAST,
  rules,
  debug,
}: ValidationArgs): void | Promise<GraphQLResponse> {
  const validationDidEnd = extensionStack.validationDidStart();
  let validationErrors: GraphQLError[] | undefined;
  try {
    validationErrors = validate(schema, documentAST, rules) as GraphQLError[]; // Return type of validate is ReadonlyArray<GraphQLError>
  } catch (validationThrewError) {
    // Catch errors thrown by validate, not just those returned by it.
    validationErrors = [validationThrewError];
  } finally {
    if (validationErrors) {
      validationErrors = formatApolloErrors(
        validationErrors.map(err =>
          fromGraphQLError(err, { errorClass: ValidationError }),
        ),
        {
          debug,
        },
      );
    }

    validationDidEnd(...(validationErrors || []));

    if (validationErrors && validationErrors.length) {
      return Promise.resolve({
        errors: validationErrors,
      });
    }
  }
}

function doExecution({
  schema,
  document,
  rootValue,
  contextValue,
  variableValues,
  operationName,
  fieldResolver,
  debug,
  extensionStack,
  options,
}: ExecutionArgs & {
  debug: boolean;
  extensionStack: GraphQLExtensionStack<any>;
  options: QueryOptions;
}): Promise<GraphQLResponse> {
  let executionArgs: ExecutionArgs = {
    schema,
    document,
    rootValue,
    contextValue,
    variableValues,
    operationName,
    fieldResolver,
  };
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
          debug,
        });
      }

      executionDidEnd(...(result.errors || []));

      const formattedExtensions = extensionStack.format();
      if (Object.keys(formattedExtensions).length > 0) {
        response.extensions = formattedExtensions;
      }

      if (options.formatResponse) {
        response = options.formatResponse(response, options);
      }

      return response;
    });
}
