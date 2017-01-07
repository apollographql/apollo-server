import * as express from 'express';
import * as graphql from 'graphql';
import * as url from 'url';
import { GraphQLOptions, runQuery } from 'graphql-server-core';
import * as GraphiQL from 'graphql-server-module-graphiql';

export interface ExpressGraphQLOptionsFunction {
  (req?: express.Request, res?: express.Response): GraphQLOptions | Promise<GraphQLOptions>;
}

// Design principles:
// - there is just one way allowed: POST request with JSON body. Nothing else.
// - simple, fast and secure
//

export interface ExpressHandler {
  (req: express.Request, res: express.Response, next): void;
}

export function graphqlExpress(options: GraphQLOptions | ExpressGraphQLOptionsFunction): ExpressHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    // TODO: test this
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`);
  }

  return async (req: express.Request, res: express.Response, next) => {
    let optionsObject: GraphQLOptions;
    if (isOptionsFunction(options)) {
      try {
        optionsObject = await options(req, res);
      } catch (e) {
        res.statusCode = 500;
        res.write(`Invalid options provided to ApolloServer: ${e.message}`);
        res.end();
      }
    } else {
      optionsObject = options;
    }

    const formatErrorFn = optionsObject.formatError || graphql.formatError;

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      res.statusCode = 405;
      res.write('Apollo Server supports only POST requests.');
      res.end();
      return;
    }

    if (!req.body) {
      res.statusCode = 500;
      res.write('POST body missing. Did you forget "app.use(bodyParser.json())"?');
      res.end();
      return;
    }

    let b = req.body;
    let isBatch = true;
    // TODO: do something different here if the body is an array.
    // Throw an error if body isn't either array or object.
    if (!Array.isArray(b)) {
      isBatch = false;
      b = [b];
    }

    let responses: Array<graphql.ExecutionResult> = [];
    for (let requestParams of b) {
      try {
        const query = requestParams.query;
        const operationName = requestParams.operationName;
        let variables = requestParams.variables;

        if (typeof variables === 'string') {
          try {
            variables = JSON.parse(variables);
          } catch (error) {
            res.statusCode = 400;
            res.write('Variables are invalid JSON.');
            res.end();
            return;
          }
        }

        // Shallow clone context for queries in batches. This allows
        // users to distinguish multiple queries in the batch and to
        // modify the context object without interfering with each other.
        let context = optionsObject.context;
        if (isBatch) {
          context = Object.assign({},  context || {});
        }

        let params = {
          schema: optionsObject.schema,
          query: query,
          variables: variables,
          context: context,
          rootValue: optionsObject.rootValue,
          operationName: operationName,
          logFunction: optionsObject.logFunction,
          validationRules: optionsObject.validationRules,
          formatError: formatErrorFn,
          formatResponse: optionsObject.formatResponse,
          debug: optionsObject.debug,
        };

        if (optionsObject.formatParams) {
          params = optionsObject.formatParams(params);
        }

        responses.push(await runQuery(params));
      } catch (e) {
        responses.push({ errors: [formatErrorFn(e)] });
      }
    }

    res.setHeader('Content-Type', 'application/json');
    if (isBatch) {
      res.write(JSON.stringify(responses));
      res.end();
    } else {
      const gqlResponse = responses[0];
      if (gqlResponse.errors && typeof gqlResponse.data === 'undefined') {
        res.statusCode = 400;
      }
      res.write(JSON.stringify(gqlResponse));
      res.end();
    }

  };
}

function isOptionsFunction(arg: GraphQLOptions | ExpressGraphQLOptionsFunction): arg is ExpressGraphQLOptionsFunction {
  return typeof arg === 'function';
}

/* This middleware returns the html for the GraphiQL interactive query UI
 *
 * GraphiQLData arguments
 *
 * - endpointURL: the relative or absolute URL for the endpoint which GraphiQL will make queries to
 * - (optional) query: the GraphQL query to pre-fill in the GraphiQL UI
 * - (optional) variables: a JS object of variables to pre-fill in the GraphiQL UI
 * - (optional) operationName: the operationName to pre-fill in the GraphiQL UI
 * - (optional) result: the result of the query to pre-fill in the GraphiQL UI
 */

export function graphiqlExpress(options: GraphiQL.GraphiQLData) {
  return (req: express.Request, res: express.Response, next) => {
    const q = req.url && url.parse(req.url, true).query || {};
    const query = q.query || '';
    const variables = q.variables || '{}';
    const operationName = q.operationName || '';

    const graphiQLString = GraphiQL.renderGraphiQL({
      endpointURL: options.endpointURL,
      query: query || options.query,
      variables: JSON.parse(variables) || options.variables,
      operationName: operationName || options.operationName,
      passHeader: options.passHeader,
    });
    res.setHeader('Content-Type', 'text/html');
    res.write(graphiQLString);
    res.end();
  };
}
