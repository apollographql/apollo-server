import {
    GraphQLSchema,
    GraphQLResult,
    Document,
    parse,
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
 formatError?: Function;
 formatResponse?: Function;
}

function runQuery(options: QueryOptions): Promise<GraphQLResult> {
    let documentAST: Document;

    function format(errors: Array<Error>): Array<Error> {
        // TODO: fix types! shouldn't have to cast.
        // the blocker is that the typings aren't right atm:
        // GraphQLResult returns Array<GraphQLError>, but the formatError function
        // returns Array<GraphQLFormattedError>
        return errors.map(options.formatError || formatError as any) as Array<Error>;
    }

    // if query is already an AST, don't parse or validate
    if (typeof options.query === 'string') {
        try {
            // TODO: time this with log function
            documentAST = parse(options.query as string);
        } catch (syntaxError) {
            return Promise.resolve({ errors: format([syntaxError]) });
        }

        // TODO: time this with log function

        let rules = specifiedRules;
        if (options.validationRules) {
          rules = rules.concat(options.validationRules);
        }
        const validationErrors = validate(options.schema, documentAST, rules);
        if (validationErrors.length) {
            return Promise.resolve({ errors: format(validationErrors) });
        }
    } else {
        documentAST = options.query as Document;
    }

    try {
        return execute(
            options.schema,
            documentAST,
            options.rootValue,
            options.context,
            options.variables,
            options.operationName
        ).then(gqlResponse => {
            let response = {
                data: gqlResponse.data,
            };
            if (gqlResponse.errors) {
                response['errors'] = format(gqlResponse.errors);
            }
            if (options.formatResponse) {
                response = options.formatResponse(response);
            }
            return response;
        });
    } catch (executionError) {
        return Promise.resolve({ errors: format([executionError]) });
    }
}

export { runQuery };
