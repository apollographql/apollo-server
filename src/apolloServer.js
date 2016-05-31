import {
  makeExecutableSchema,
  buildSchemaFromTypeDefinitions,
  addErrorLoggingToSchema,
  addCatchUndefinedToSchema,
  addResolveFunctionsToSchema,
  addTracingToResolvers,
  attachConnectorsToContext,
} from 'graphql-tools';
import { addMockFunctionsToSchema } from 'graphql-tools';
import graphqlHTTP from 'express-widgetizer';
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
    let tracerLogger;

    // TODO instrument ApolloServer's schema creation as well, so you know how long
    // it takes. May be a big waste of time to recreate the schema for every request.

    return new Promise(resolve => {
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
        tracer,
        printErrors,
        mocks = false,
        allowUndefinedInResolve = true,
        pretty, // pass through
        graphiql = false, // pass through
        validationRules, // pass through
        context = {}, // pass through, but add tracer if applicable
        rootValue, // pass through
      } = optionsData;

      // would collide with formatError from graphql otherwise
      const formatErrorFn = optionsData.formatError;

      // TODO: currently relies on the fact that start and end both exist
      // and appear in the correct order and exactly once.
      function processInterval(supertype, subtype, tstamp, intervalMap) {
        if (subtype === 'start') {
          // eslint-disable-next-line no-param-reassign
          intervalMap[supertype] = tstamp;
        }
        if (subtype === 'end') {
          // eslint-disable-next-line no-param-reassign
          intervalMap[supertype] = tstamp - intervalMap[supertype];
        }
      }

      let executableSchema;
      if (mocks) {
        // TODO: mocks doesn't yet work with a normal GraphQL schema, but it should!
        // have to rewrite these functions
        const myMocks = mocks || {};
        if (schema instanceof GraphQLSchema) {
          executableSchema = schema;
        } else {
          executableSchema = buildSchemaFromTypeDefinitions(schema);
        }
        addResolveFunctionsToSchema(executableSchema, resolvers || {});
        addMockFunctionsToSchema({
          schema: executableSchema,
          mocks: myMocks,
          preserveResolvers: true,
        });
        if (connectors) {
          attachConnectorsToContext(executableSchema, connectors);
        }
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
          if (resolvers) {
            addResolveFunctionsToSchema(executableSchema, resolvers);
          }
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

      // Tracer-related stuff ------------------------------------------------

      tracerLogger = { log: undefined, report: undefined };
      if (tracer) {
        tracerLogger = tracer.newLoggerInstance();
        tracerLogger.log('request.info', {
          headers: req.headers,
          baseUrl: req.baseUrl,
          originalUrl: req.originalUrl,
          method: req.method,
          httpVersion: req.httpVersion,
          remoteAddr: req.connection.remoteAddress,
        });
        if (context.tracer) {
          throw new Error('Property tracer on context already defined, cannot attach Tracer');
        } else {
          context.tracer = tracerLogger;
        }
        if (!executableSchema._apolloTracerApplied) {
          addTracingToResolvers(executableSchema);
        }
      }

      // TODO: move to proper place, make less fragile ...
      // calculate timing information from events
      function timings(events) {
        const resolverDurations = [];
        const intervalMap = {};

        // split by event.type = [ , ]
        events.forEach(e => {
          const [supertype, subtype] = e.type.split('.');
          switch (supertype) {
            case 'request':
            case 'parse':
            case 'validation':
            case 'execution':
            case 'parseBody':
            case 'parseParams':
              processInterval(supertype, subtype, e.timestamp, intervalMap);
              break;
            case 'resolver':
              if (subtype === 'end') {
                resolverDurations.push({
                  type: 'resolve',
                  functionName: e.data.functionName,
                  duration: e.timestamp - events[e.data.startEventId].timestamp,
                });
              }
              break;
            default:
              console.error(`Unknown event type ${supertype}`);
          }
        });

        const durations = [];
        Object.keys(intervalMap).forEach((key) => {
          durations.push({
            type: key,
            functionName: null,
            duration: intervalMap[key],
          });
        });
        return durations.concat(resolverDurations);
      }

      let extensionsFn = function extensionsFn() {
        try {
          return {
            timings: timings(tracerLogger.report().events),
            tracer: tracerLogger.report().events.map(e => ({
              id: e.id,
              type: e.type,
              ts: e.timestamp,
              data: e.data,
            })).filter(x => x.type !== 'initialization'),
          };
        } catch (e) {
          console.error(e);
          console.error(e.stack);
        }
        return {};
      };

      // XXX ugly way of only passing extensionsFn when tracer is defined.
      if (!tracer || req.headers['x-apollo-tracer-extension'] !== 'on') {
        extensionsFn = undefined;
      }

      // end of Tracer related stuff -------------------------------------------

      // graphQLHTTPOptions
      return {
        schema: executableSchema,
        pretty,
        formatError: formatErrorFn,
        validationRules,
        context,
        rootValue,
        graphiql,
        logFn: tracerLogger.log,
        extensionsFn,
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
      return result;
    }).then(() => {
      // send traces to Apollo Tracer
      tracerLogger.submit();
    });
  };
}

export { apolloServer };
