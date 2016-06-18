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
 //logFunction?: function => void
 //validationRules?: No, too risky. If you want extra validation rules, then parse it yourself.
}

function runQuery(options: QueryOptions): Promise<GraphQLResult> {
    let documentAST: Document;

    // if query is already an AST, don't parse or validate
    if (typeof options.query === 'string') {
        // parse
        try {
            documentAST = parse(options.query as string);
        } catch (syntaxError) {
            return Promise.resolve({ errors: [syntaxError] });
        }

        // validate
        const validationErrors = validate(options.schema, documentAST);
        if (validationErrors.length) {
            return Promise.resolve({ errors: validationErrors });
        }
    } else {
        documentAST = options.query as Document;
    }

    // execute
    return execute(
        options.schema,
        documentAST,
        options.rootValue,
        options.context,
        options.variables,
        options.operationName
    );
}

export { runQuery };
