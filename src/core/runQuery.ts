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

function runQuery({
    schema,
    query,
    rootValue,
    context,
    variables,
    operationName,
 }: {
  schema: GraphQLSchema,
  query: string | Document,
  rootValue?: any,
  context?: any,
  variables?: { [key: string]: any },
  operationName?: string,
  //logFunction?: function => void
  //validationRules?: No, too risky. If you want extra validation rules, then parse it yourself.
 }): Promise<GraphQLResult> {
    let documentAST: Document;

    // if query is already an AST, don't parse or validate
    if (typeof query === 'string') {
        // parse
        try {
            documentAST = parse(query);
        } catch (syntaxError) {
            return Promise.resolve({ errors: [syntaxError] });
        }

        // validate
        const validationErrors = validate(schema, documentAST);
        if (validationErrors.length) {
            return Promise.resolve({ errors: validationErrors });
        }
    } else {
        documentAST = query;
    }

    // execute
    return execute(
        schema,
        documentAST,
        rootValue,
        context,
        variables,
        operationName
    );
}

export { runQuery };
