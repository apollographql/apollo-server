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

export interface QueryOptions {
 schema: GraphQLSchema;
 query: string | Document;
 rootValue?: any;
 context?: any;
 variables?: { [key: string]: any };
 operationName?: string;
 logFunction?: Function;
 validationRules?: Array<ValidationRule>;
 // WARNING: these extra validation rules are only applied to queries
 // submitted as string, not those submitted as Document!

 formatError?: Function;
 formatResponse?: Function;
}

function runQuery(options: QueryOptions): Promise<GraphQLResult> {
    let documentAST: Document;

    const logFunction = options.logFunction || function(){ return null; };

    logFunction('request.start');

    function format(errors: Array<Error>): Array<Error> {
        // TODO: fix types! shouldn't have to cast.
        // the blocker is that the typings aren't right atm:
        // GraphQLResult returns Array<GraphQLError>, but the formatError function
        // returns Array<GraphQLFormattedError>
        return errors.map(options.formatError || formatError as any) as Array<Error>;
    }

    logFunction('request.query', typeof options.query === 'string' ? options.query : print(options.query));
    logFunction('request.variables', options.variables);
    logFunction('request.operationName', options.operationName);

    // if query is already an AST, don't parse or validate
    if (typeof options.query === 'string') {
        try {
            // TODO: time this with log function
            logFunction('parse.start');
            documentAST = parse(options.query as string);
            logFunction('parse.end');
        } catch (syntaxError) {
            logFunction('parse.end');
            return Promise.resolve({ errors: format([syntaxError]) });
        }

        // TODO: time this with log function

        let rules = specifiedRules;
        if (options.validationRules) {
          rules = rules.concat(options.validationRules);
        }
        logFunction('validation.start');
        const validationErrors = validate(options.schema, documentAST, rules);
        logFunction('validation.end');
        if (validationErrors.length) {
            return Promise.resolve({ errors: format(validationErrors) });
        }
    } else {
        documentAST = options.query as Document;
    }

    try {
        logFunction('execution.start');
        return execute(
            options.schema,
            documentAST,
            options.rootValue,
            options.context,
            options.variables,
            options.operationName
        ).then(gqlResponse => {
            logFunction('execution.end');
            let response = {
                data: gqlResponse.data,
            };
            if (gqlResponse.errors) {
                response['errors'] = format(gqlResponse.errors);
            }
            if (options.formatResponse) {
                response = options.formatResponse(response, options);
            }
            logFunction('request.end');
            return response;
        });
    } catch (executionError) {
        logFunction('execution.end');
        logFunction('request.end');
        return Promise.resolve({ errors: format([executionError]) });
    }
}

export { runQuery };
