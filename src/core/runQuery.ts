import {
    GraphQLSchema,
    GraphQLResult,
    Document,
    parse,
    print,
    validate,
    execute,
    formatError,
    specifiedRules,
    ValidationRule,
} from 'graphql';

export interface GqlResponse {
    data?: Object;
    errors?: Array<string>;
}

export enum LogAction {
  request, parse, validation, execute
}

export enum LogStep {
  start, end
}

export interface LogMessage {
  action: LogAction;
  step: LogStep;
  data?: Object;
}

export interface LogFunction {
  (message: LogMessage);
}

export interface QueryOptions {
 schema: GraphQLSchema;
 query: string | Document;
 rootValue?: any;
 context?: any;
 variables?: { [key: string]: any };
 operationName?: string;
 logFunction?: LogFunction;
 validationRules?: Array<ValidationRule>;
 // WARNING: these extra validation rules are only applied to queries
 // submitted as string, not those submitted as Document!

 formatError?: Function;
 formatResponse?: Function;
}

const resolvedPromise = Promise.resolve();

function runQuery(options: QueryOptions): Promise<GraphQLResult> {
    // Fiber-aware Promises run their .then callbacks in Fibers.
    return resolvedPromise.then(() => doRunQuery(options));
}

function doRunQuery(options: QueryOptions): Promise<GraphQLResult> {
    let documentAST: Document;

    const logFunction = options.logFunction || function(){ return null; };

    logFunction({action: LogAction.request, step: LogStep.start});

    function format(errors: Array<Error>): Array<Error> {
        // TODO: fix types! shouldn't have to cast.
        // the blocker is that the typings aren't right atm:
        // GraphQLResult returns Array<GraphQLError>, but the formatError function
        // returns Array<GraphQLFormattedError>
        return errors.map(options.formatError || formatError as any) as Array<Error>;
    }

    const qry = typeof options.query === 'string' ? options.query : print(options.query);
    logFunction({action: LogAction.request, step: LogStep.start, data: `query: ${qry}`});
    logFunction({action: LogAction.request, step: LogStep.start, data: `variables: ${options.variables}`});
    logFunction({action: LogAction.request, step: LogStep.start, data: `operationName: ${options.operationName}`});

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
        documentAST = options.query as Document;
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
