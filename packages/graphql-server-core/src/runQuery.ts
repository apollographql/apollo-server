import {
    GraphQLError,
    GraphQLFormattedError,
    GraphQLSchema,
    ExecutionResult,
    DocumentNode,
    parse,
    print,
    validate,
    execute,
    formatError,
    specifiedRules,
} from 'graphql';
import { ValidationRule } from './graphqlOptions';

export interface GqlResponse {
    data?: Object;
    errors?: Array<string>;
}

export enum LogAction {
  request, parse, validation, execute
}

export enum LogStep {
  start, end, status
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
 validationRules?: Array<ValidationRule>;
 // WARNING: these extra validation rules are only applied to queries
 // submitted as string, not those submitted as DocumentNode!

 formatError?: (e: GraphQLError) => GraphQLFormattedError;
 formatResponse?: Function;
 debug?: boolean;
}

const resolvedPromise = Promise.resolve();

function runQuery(options: QueryOptions): Promise<ExecutionResult> {
    // Fiber-aware Promises run their .then callbacks in Fibers.
    return resolvedPromise.then(() => doRunQuery(options));
}

function doRunQuery(options: QueryOptions): Promise<ExecutionResult> {
    let documentAST: DocumentNode;

    const logFunction = options.logFunction || function(){ return null; };
    const debugDefault = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
    const debug = typeof options.debug !== 'undefined' ? options.debug : debugDefault;

    logFunction({action: LogAction.request, step: LogStep.start});

    function format(errors: Array<GraphQLError>): Array<GraphQLFormattedError> {
        return errors.map((error) => {
          if (options.formatError) {
            try {
              return options.formatError(error);
            } catch (err) {
              console.error('Error in formatError function:', err);
              const newError = new GraphQLError('Internal server error');
              return formatError(newError);
            }
          } else {
            return formatError(error);
          }
        }) as Array<GraphQLFormattedError>;
    }

    function printStackTrace(error: Error) {
      console.error(error.stack);
    }

    const qry = typeof options.query === 'string' ? options.query : print(options.query);
    logFunction({action: LogAction.request, step: LogStep.status, key: 'query', data: qry});
    logFunction({action: LogAction.request, step: LogStep.status, key: 'variables', data: options.variables});
    logFunction({action: LogAction.request, step: LogStep.status, key: 'operationName', data: options.operationName});

    // if query is already an AST, don't parse or validate
    if (typeof options.query === 'string') {
        try {
            // TODO: time this with log function
            logFunction({action: LogAction.parse, step: LogStep.start});
            documentAST = parse(options.query as string);
            logFunction({action: LogAction.parse, step: LogStep.end});
        } catch (syntaxError) {
            logFunction({action: LogAction.parse, step: LogStep.end});
            return Promise.resolve({ errors: format([syntaxError]) });
        }

        // TODO: time this with log function

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
    } else {
        documentAST = options.query as DocumentNode;
    }

    try {
        logFunction({action: LogAction.execute, step: LogStep.start});
        return execute(
            options.schema,
            documentAST,
            options.rootValue,
            options.context,
            options.variables,
            options.operationName
        ).then(gqlResponse => {
            logFunction({action: LogAction.execute, step: LogStep.end});
            logFunction({action: LogAction.request, step: LogStep.end});
            let response = {
                data: gqlResponse.data,
            };
            if (gqlResponse.errors) {
                response['errors'] = format(gqlResponse.errors);
                if (debug) {
                  gqlResponse.errors.map(printStackTrace);
                }
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
