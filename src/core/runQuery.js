var graphql_1 = require('graphql');
function runQuery(schema, query, rootValue, context, variables, operationName) {
    var documentAST;
    // if query is already an AST, don't parse or validate
    if (typeof query === 'string') {
        // parse
        try {
            documentAST = graphql_1.parse(query);
        }
        catch (syntaxError) {
            return Promise.resolve({ errors: [syntaxError] });
        }
        // validate
        var validationErrors = graphql_1.validate(schema, documentAST, []);
        if (validationErrors.length) {
            return Promise.resolve({ errors: validationErrors });
        }
    }
    else {
        documentAST = query;
    }
    // execute
    return graphql_1.execute(schema, documentAST, rootValue, context, variables, operationName);
}
exports.runQuery = runQuery;
