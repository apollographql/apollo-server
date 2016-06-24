import {
    GraphQLSchema,
    GraphQLResult,
    Document,
    parse,
    validate,
    execute,
} from 'graphql';

<<<<<<< HEAD
// TODO: maybe return a status as well,
// because for HTTP we need to return 200, 400, 405 etc.

// the annoying thing is that if we want to allow operations over GET
// then we need to parse the request before we pass it in to make sure
// it's a query and not a mutation or something else.

=======
>>>>>>> f6f25c611ef12603e46c675ec01febd356579b70
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

    // TODO: add loggingFunction

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
        // validate variables here, i.e. noUndefinedVariables, NoUnusedVariables, ArgumentsOfCorrectType?
        // TODO: the way graphql-js validates this could be inefficient.
    }

    // execute
    try {
        return execute(
            schema,
            documentAST,
            rootValue,
            context,
            variables,
            operationName
        );
    } catch (executionError) {
        return Promise.resolve({ errors: [ executionError ] });
    }
}

export { runQuery };
