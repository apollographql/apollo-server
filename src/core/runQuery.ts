import {
    GraphQLSchema,
    GraphQLResult,
    Document,
    parse,
    validate,
    execute,
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
        );
    } catch (executionError) {
        return Promise.resolve({ errors: [ executionError ] });
    }
}

export { runQuery };
