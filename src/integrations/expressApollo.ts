import * as express from 'express';
import * as graphql from 'graphql';
import { runQuery } from '../core/runQuery';

import ApolloOptions from './apolloOptions';
import * as GraphiQL from '../modules/renderGraphiQL';

export interface ExpressApolloOptionsFunction {
  (req?: express.Request): ApolloOptions | Promise<ApolloOptions>;
}

// Design principles:
// - there is just one way allowed: POST request with JSON body. Nothing else.
// - simple, fast and secure
//

export interface ExpressHandler {
  (req: express.Request, res: express.Response, next): void;
}

export function apolloExpress(options: ApolloOptions | ExpressApolloOptionsFunction): ExpressHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    // TODO: test this
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length + 1}`);
  }

  return async (req: express.Request, res: express.Response, next) => {
    let optionsObject: ApolloOptions;
    if (isOptionsFunction(options)) {
      try {
        optionsObject = await options(req);
      } catch (e) {
        res.status(500);
        res.send(`Invalid options provided to ApolloServer: ${e.message}`);
      }
    } else {
      optionsObject = options;
    }

    const formatErrorFn = optionsObject.formatError || graphql.formatError;

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      res.status(405);
      res.send('Apollo Server supports only POST requests.');
      return;
    }

    if (!req.body) {
      res.status(500);
      res.send('POST body missing. Did you forget "app.use(bodyParser.json())"?');
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

    let responses: Array<graphql.GraphQLResult> = [];
    for (let requestParams of b) {
      try {
        const query = requestParams.query;
        const operationName = requestParams.operationName;
        let variables = requestParams.variables;

        if (typeof variables === 'string') {
          // TODO: catch errors
          variables = JSON.parse(variables);
        }

        let params = {
          schema: optionsObject.schema,
          query: query,
          variables: variables,
          context: optionsObject.context,
          rootValue: optionsObject.rootValue,
          operationName: operationName,
          logFunction: optionsObject.logFunction,
          validationRules: optionsObject.validationRules,
          formatError: formatErrorFn,
          formatResponse: optionsObject.formatResponse,
        };

        if (optionsObject.formatParams) {
          params = optionsObject.formatParams(params);
        }

        responses.push(await runQuery(params));
      } catch (e) {
        responses.push({ errors: [formatErrorFn(e)] });
      }
    }

    res.set('Content-Type', 'application/json');
    if (isBatch) {
      res.send(JSON.stringify(responses));
    } else {
      const gqlResponse = responses[0];
      if (gqlResponse.errors && typeof gqlResponse.data === 'undefined') {
        res.status(400);
      }
      res.send(JSON.stringify(gqlResponse));
    }

  };
}

function isOptionsFunction(arg: ApolloOptions | ExpressApolloOptionsFunction): arg is ExpressApolloOptionsFunction {
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

    const q = req.query || {};
    const query = q.query || '';
    const variables = q.variables || '{}';
    const operationName = q.operationName || '';


    const graphiQLString = GraphiQL.renderGraphiQL({
      endpointURL: options.endpointURL,
      query: query || options.query,
      variables: JSON.parse(variables) || options.variables,
      operationName: operationName || options.operationName,
    });
    res.set('Content-Type', 'text/html');
    res.send(graphiQLString);
  };
}
