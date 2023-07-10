---
'@apollo/server-integration-testsuite': minor
'@apollo/server': minor
---

Updating the ApolloServer constructor to take in a stringifyResult function that will allow a consumer to pass in a function that formats the result of an http query.

Usage:

        const server = new ApolloServer({
          typeDefs,
          resolvers,
          stringifyResult: (value: FormattedExecutionResult) => {
            let result = JSON.stringify(value, null, 10000) // modify response
            result = result.replace('world', 'stringifyResults works!'); // replace text with something custom
            return result;
          },
        });
