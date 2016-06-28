import {
    GraphQLSchema,
    GraphQLResult,
    Document,
    parse,
    validate,
    execute,
    formatError,
    // specifiedRules, // TODO: this isn't in the type definitions yet, so we can't import it.
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
 validationRules?: Array<Function>;
 formatError?: Function;
 formatResponse?: Function;
}

function runQuery(options: QueryOptions): Promise<GraphQLResult> {
    let documentAST: Document;


    // if query is already an AST, don't parse or validate
    if (typeof options.query === 'string') {
        try {
            // TODO: time this with log function
            documentAST = parse(options.query as string);
        } catch (syntaxError) {
            return Promise.resolve({ errors: [syntaxError] });
        }

        // TODO: time this with log function

        // TODO: allow extra validationRules
        // let rules = specifiedRules;
        // if (options.validationRules) {
        //    rules = rules.concat(options.validationRules);
        // }
        // const validationErrors = validate(options.schema, documentAST, rules);
        const validationErrors = validate(options.schema, documentAST);
        if (validationErrors.length) {
            return Promise.resolve({ errors: validationErrors });
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
                response['errors'] = gqlResponse.errors.map(options.formatError || formatError as any);
                // TODO: stop any creep. Fix the issue here.
            }
            if (options.formatResponse) {
                response = options.formatResponse(response);
            }
            return response;
        });
    } catch (executionError) {
        return Promise.resolve({ errors: [ executionError ] });
    }
}

export { runQuery };
