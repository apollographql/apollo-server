import { GraphQLSchema, GraphQLResult, Document } from 'graphql';
import { parse, validate, execute } from 'graphql';

interface gqlResponse {
    data?: Object,
    errors?: Array<string>,
}

function runQuery(
  schema: GraphQLSchema,
  query: string | Document,
  rootValue?: any,
  context?: any,
  variables?: { [key: string]: any },
  operationName?: string,
  //logFunction?: function => void,
) : Promise<GraphQLResult> {
    let documentAST: Document;

    // if query is already an AST, don't parse or validate
    if (typeof query === 'string'){
        // parse
        try {
            documentAST = parse(query);
        } catch (syntaxError) {
            return Promise.resolve({ errors: [syntaxError] });
        }

        // validate
        const validationErrors = validate(schema, documentAST, []);
        if (validationErrors.length) {
            return Promise.resolve({ errors: validationErrors })
        }
    } else {
        documentAST = query
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
