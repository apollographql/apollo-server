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
  TraceCollector,
  instrumentSchemaForTracing,
  formatTraceData,
} from 'apollo-tracing';

export interface GraphQLResponse {
  data?: object;
  errors?: Array<GraphQLError & object>;
  extensions?: object;
}

export enum LogAction {
  request, parse, validation, execute,
}

export enum LogStep {
  start, end, status,
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
}

const resolvedPromise = Promise.resolve();

function runQuery(options: QueryOptions): Promise<GraphQLResponse> {
    // Fiber-aware Promises run their .then callbacks in Fibers.
    return resolvedPromise.then(() => doRunQuery(options));
}

function doRunQuery(options: QueryOptions): Promise<GraphQLResponse> {
    let documentAST: DocumentNode;

    const logFunction = options.logFunction || function(){ return null; };
    const debugDefault = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
    const debug = typeof options.debug !== 'undefined' ? options.debug : debugDefault;

    logFunction({action: LogAction.request, step: LogStep.start});

    const context = options.context || {};

    let traceCollector: TraceCollector;
    if (options.tracing) {
      traceCollector = new TraceCollector();
      context._traceCollector = traceCollector;
      traceCollector.requestDidStart();
      instrumentSchemaForTracing(options.schema);
    }

    function format(errors: Array<Error>): Array<Error> {
        return errors.map((error) => {
          if (options.formatError) {
            try {
              return options.formatError(error);
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

    function printStackTrace(error: Error) {
      console.error(error.stack);
    }

    const qry = typeof options.query === 'string' ? options.query : print(options.query);
    logFunction({action: LogAction.request, step: LogStep.status, key: 'query', data: qry});
    logFunction({action: LogAction.request, step: LogStep.status, key: 'variables', data: options.variables});
    logFunction({action: LogAction.request, step: LogStep.status, key: 'operationName', data: options.operationName});

    // if query is already an AST, don't parse or validate
    // XXX: This refers the operations-store flow.
    if (typeof options.query === 'string') {
        try {
            logFunction({action: LogAction.parse, step: LogStep.start});
            documentAST = parse(options.query as string);
            logFunction({action: LogAction.parse, step: LogStep.end});
        } catch (syntaxError) {
            logFunction({action: LogAction.parse, step: LogStep.end});
            return Promise.resolve({ errors: format([syntaxError]) });
        }
    } else {
        documentAST = options.query as DocumentNode;
    }

    let rules = specifiedRules;
    if (options.validationRules) {
      rules = rules.concat(options.validationRules);
    }
    logFunction({action: LogAction.validation, step: LogStep.start});
    const validationErrors = validate(options.schema, documentAST, rules);
    logFunction({action: LogAction.validation, step: LogStep.end});
    if (validationErrors.length) {
      return Promise.resolve({ errors: format(validationErrors) });
    }

    if (traceCollector) {
      traceCollector.executionDidStart();
    }

    try {
        logFunction({action: LogAction.execute, step: LogStep.start});
        return execute(
            options.schema,
            documentAST,
            options.rootValue,
            context,
            options.variables,
            options.operationName,
            options.fieldResolver,
        ).then(result => {
            logFunction({action: LogAction.execute, step: LogStep.end});
            logFunction({action: LogAction.request, step: LogStep.end});

            let response: GraphQLResponse = {
                data: result.data,
            };

            if (result.errors) {
                response.errors = format(result.errors);
                if (debug) {
                  result.errors.map(printStackTrace);
                }
            }

            if (traceCollector) {
              traceCollector.requestDidEnd();
              response.extensions = {
                'tracing': formatTraceData(traceCollector),
              };
            }

            if (options.formatResponse) {
                response = options.formatResponse(response, options);
            }

            return response;
        });
    } catch (executionError) {
        logFunction({action: LogAction.execute, step: LogStep.end});
        logFunction({action: LogAction.request, step: LogStep.end});
        return Promise.resolve({ errors: format([executionError]) });
    }
}

export { runQuery };
