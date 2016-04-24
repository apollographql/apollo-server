'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.apolloServer = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = apolloServer;

var _schemaGenerator = require('./schemaGenerator');

var _mock = require('./mock');

var _expressGraphql = require('express-graphql');

var _expressGraphql2 = _interopRequireDefault(_expressGraphql);

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO this implementation could use a bit of refactoring.
// it turned from a simple function into something promise-based,
// which means the structure is now quite awkward.

function apolloServer(options) {
  if (!options) {
    throw new Error('GraphQL middleware requires options.');
  }
  if (arguments.length - 1 > 0) {
    throw new Error('apolloServer expects exactly one argument, got ' + (arguments.length - 1 + 1));
  }
  // Resolve the Options to get OptionsData.
  return function (req, res) {
    new Promise(function (resolve) {
      resolve(typeof options === 'function' ? options(req) : options);
    }).then(function (optionsData) {
      // Assert that optionsData is in fact an Object.
      if (!optionsData || (typeof optionsData === 'undefined' ? 'undefined' : _typeof(optionsData)) !== 'object') {
        throw new Error('GraphQL middleware option function must return an options object.');
      }

      // Assert that schema is required.
      if (!optionsData.schema) {
        throw new Error('GraphQL middleware options must contain a schema.');
      }
      var schema = // pass through
      optionsData.schema;
      var // required
      resolvers = optionsData.resolvers;
      var // required if mocks is not false and schema is not GraphQLSchema
      connectors = optionsData.connectors;
      var // required if mocks is not false and schema is not GraphQLSchema
      logger = optionsData.logger;
      var printErrors = optionsData.printErrors;
      var _optionsData$mocks = optionsData.mocks;
      var mocks = _optionsData$mocks === undefined ? false : _optionsData$mocks;
      var _optionsData$allowUnd = optionsData.allowUndefinedInResolve;
      var allowUndefinedInResolve = _optionsData$allowUnd === undefined ? true : _optionsData$allowUnd;
      var pretty = optionsData.pretty;
      var _optionsData$graphiql = optionsData.graphiql;
      var // pass through
      graphiql = _optionsData$graphiql === undefined ? false : _optionsData$graphiql;
      var // pass through
      validationRules = optionsData.validationRules;
      var _optionsData$context = optionsData.context;
      var // pass through
      context = _optionsData$context === undefined ? {} : _optionsData$context;
      var // pass through
      rootValue = optionsData.rootValue;

      // would collide with formatError from graphql otherwise

      var formatErrorFn = optionsData.formatError;

      var executableSchema = void 0;
      if (mocks) {
        // TODO: mocks doesn't yet work with a normal GraphQL schema, but it should!
        // have to rewrite these functions
        var myMocks = mocks || {};
        executableSchema = (0, _schemaGenerator.buildSchemaFromTypeDefinitions)(schema);
        (0, _mock.addMockFunctionsToSchema)({
          schema: executableSchema,
          mocks: myMocks
        });
      } else {
        // this is just basics, makeExecutableSchema should catch the rest
        // TODO: should be able to provide a GraphQLschema and still use resolvers
        // and connectors if you want, but at the moment this is not possible.
        if (schema instanceof _graphql.GraphQLSchema) {
          if (logger) {
            (0, _schemaGenerator.addErrorLoggingToSchema)(schema, logger);
          }
          if (printErrors) {
            (0, _schemaGenerator.addErrorLoggingToSchema)(schema, { log: function log(e) {
                return console.error(e.stack);
              } });
          }
          if (!allowUndefinedInResolve) {
            (0, _schemaGenerator.addCatchUndefinedToSchema)(schema);
          }
          executableSchema = schema;
        } else {
          if (!resolvers) {
            // TODO: test this error
            throw new Error('resolvers is required option if mocks is not provided');
          }
          executableSchema = (0, _schemaGenerator.makeExecutableSchema)({
            typeDefs: schema,
            resolvers: resolvers,
            connectors: connectors,
            logger: logger,
            allowUndefinedInResolve: allowUndefinedInResolve
          });
          if (printErrors) {
            (0, _schemaGenerator.addErrorLoggingToSchema)(executableSchema, { log: function log(e) {
                return console.error(e.stack);
              } });
          }
        }
      }
      // graphQLHTTPOptions
      return {
        schema: executableSchema,
        pretty: pretty,
        formatError: formatErrorFn,
        validationRules: validationRules,
        context: context,
        rootValue: rootValue,
        graphiql: graphiql
      };
    }).then(function (graphqlHTTPOptions) {
      return (0, _expressGraphql2.default)(graphqlHTTPOptions)(req, res);
    }).catch(function (error) {
      // express-graphql catches its own errors, this is just for
      // errors in Apollo-server.
      // XXX we should probably care about formatErrorFn and pretty.
      res.status(error.status || 500);
      var result = { errors: [error] };
      result.errors = result.errors.map(_graphql.formatError);
      res.set('Content-Type', 'application/json').send(JSON.stringify(result));
    });
  };
}

exports.apolloServer = apolloServer;