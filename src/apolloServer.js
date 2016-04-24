import {
  makeExecutableSchema,
  buildSchemaFromTypeDefinitions,
  addErrorLoggingToSchema,
  addCatchUndefinedToSchema,
} from 'graphql-tools';
import { addMockFunctionsToSchema } from 'graphql-tools';
import graphqlHTTP from 'express-graphql';
import { GraphQLSchema, formatError } from 'graphql';

// TODO this implementation could use a bit of refactoring.
// it turned from a simple function into something promise-based,
// which means the structure is now quite awkward.

export default function apolloServer(options, ...rest) {
  if (!options) {
    throw new Error('GraphQL middleware requires options.');
  }
  if (rest.length > 0) {
    throw new Error(`apolloServer expects exactly one argument, got ${rest.length + 1}`);
  }
  // Resolve the Options to get OptionsData.
  return (req, res) => {
    new Promise(resolve => {
      resolve(typeof options === 'function' ? options(req) : options);
    }).then(optionsData => {
      // Assert that optionsData is in fact an Object.
      if (!optionsData || typeof optionsData !== 'object') {
        throw new Error(
          'GraphQL middleware option function must return an options object.'
        );
      }

      // Assert that schema is required.
      if (!optionsData.schema) {
        throw new Error(
          'GraphQL middleware options must contain a schema.'
        );
      }
      const {
        schema, // required
        resolvers, // required if mocks is not false and schema is not GraphQLSchema
        connectors, // required if mocks is not false and schema is not GraphQLSchema
        logger,
        printErrors,
        mocks = false,
        allowUndefinedInResolve = true,
        pretty, // pass through
        graphiql = false, // pass through
        validationRules, // pass through
        context = {}, // pass through
        rootValue, // pass through
      } = optionsData;

      // would collide with formatError from graphql otherwise
      const formatErrorFn = optionsData.formatError;

      let executableSchema;
      if (mocks) {
        // TODO: mocks doesn't yet work with a normal GraphQL schema, but it should!
        // have to rewrite these functions
        const myMocks = mocks || {};
        executableSchema = buildSchemaFromTypeDefinitions(schema);
        addMockFunctionsToSchema({
          schema: executableSchema,
          mocks: myMocks,
        });
      } else {
        // this is just basics, makeExecutableSchema should catch the rest
        // TODO: should be able to provide a GraphQLschema and still use resolvers
        // and connectors if you want, but at the moment this is not possible.
        if (schema instanceof GraphQLSchema) {
          if (logger) {
            addErrorLoggingToSchema(schema, logger);
          }
          if (printErrors) {
            addErrorLoggingToSchema(schema, { log: (e) => console.error(e.stack) });
          }
          if (!allowUndefinedInResolve) {
            addCatchUndefinedToSchema(schema);
          }
          executableSchema = schema;
        } else {
          if (!resolvers) {
            // TODO: test this error
            throw new Error('resolvers is required option if mocks is not provided');
          }
          executableSchema = makeExecutableSchema({
            typeDefs: schema,
            resolvers,
            connectors,
            logger,
            allowUndefinedInResolve,
          });
          if (printErrors) {
            addErrorLoggingToSchema(executableSchema, { log: (e) => console.error(e.stack) });
          }
        }
      }
      // graphQLHTTPOptions
      return {
        schema: executableSchema,
        pretty,
        formatError: formatErrorFn,
        validationRules,
        context,
        rootValue,
        graphiql,
      };
    }).then((graphqlHTTPOptions) => {
      return graphqlHTTP(graphqlHTTPOptions)(req, res);
    }).catch(error => {
      // express-graphql catches its own errors, this is just for
      // errors in Apollo-server.
      // XXX we should probably care about formatErrorFn and pretty.
      res.status(error.status || 500);
      const result = { errors: [error] };
      result.errors = result.errors.map(formatError);
      res
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(result));
    });
  };
}

export { apolloServer };
