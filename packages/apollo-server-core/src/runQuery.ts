import {
  GraphQLSchema,
  GraphQLFieldResolver,
  ExecutionResult,
  DocumentNode,
  parse,
  print,
  validate,
  execute,
  GraphQLError,
  formatError,
  specifiedRules,
  ValidationContext,
} from 'graphql';

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

export interface GraphQLResponse {
  data?: object;
  errors?: Array<GraphQLError & object>;
  extensions?: object;
}

export enum LogAction {
  request,
  parse,
  validation,
  execute,
}

export enum LogStep {
  start,
  end,
  status,
}

export interface LogMessage {
  action: LogAction;
  step: LogStep;
  key?: string;
  data?: Object;
}

export interface LogFunction {
  (message: LogMessage);
}

export interface QueryOptions {
  schema: GraphQLSchema;
  query: string | DocumentNode;
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
  cacheControl?: boolean | CacheControlExtensionOptions;
}

export function runQuery(options: QueryOptions): Promise<GraphQLResponse> {
  // Fiber-aware Promises run their .then callbacks in Fibers.
  return Promise.resolve().then(() => doRunQuery(options));
}

function printStackTrace(error: Error) {
  console.error(error.stack);
}

function format(errors: Array<Error>, formatter?: Function): Array<Error> {
  return errors.map(error => {
    if (formatter !== undefined) {
      try {
        return formatter(error);
      } catch (err) {
        console.error('Error in formatError function:', err);
        const newError = new Error('Internal server error');
        return formatError(newError);
      }
    } else {
      return formatError(error);
    }
  }) as Array<Error>;
}

function doRunQuery(options: QueryOptions): Promise<GraphQLResponse> {
  let documentAST: DocumentNode;

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

  const qry =
    typeof options.query === 'string' ? options.query : print(options.query);
  logFunction({
    action: LogAction.request,
    step: LogStep.status,
    key: 'query',
    data: qry,
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

  // if query is already an AST, don't parse or validate
  // XXX: This refers the operations-store flow.
  if (typeof options.query === 'string') {
    try {
      logFunction({ action: LogAction.parse, step: LogStep.start });
      documentAST = parse(options.query as string);
      logFunction({ action: LogAction.parse, step: LogStep.end });
    } catch (syntaxError) {
      logFunction({ action: LogAction.parse, step: LogStep.end });
      return Promise.resolve({
        errors: format([syntaxError], options.formatError),
      });
    }
  } else {
    documentAST = options.query as DocumentNode;
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
      errors: format(validationErrors, options.formatError),
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
      logFunction({ action: LogAction.request, step: LogStep.end });

      let response: GraphQLResponse = {
        data: result.data,
      };

      if (result.errors) {
        response.errors = format(result.errors, options.formatError);
        if (debug) {
          result.errors.map(printStackTrace);
        }
      }

      if (extensionStack) {
        extensionStack.executionDidEnd();
        extensionStack.requestDidEnd();
        response.extensions = extensionStack.format();
      }

      if (options.formatResponse) {
        response = options.formatResponse(response, options);
      }

      return response;
    });
  } catch (executionError) {
    logFunction({ action: LogAction.execute, step: LogStep.end });
    logFunction({ action: LogAction.request, step: LogStep.end });
    return Promise.resolve({
      errors: format([executionError], options.formatError),
    });
  }
}
