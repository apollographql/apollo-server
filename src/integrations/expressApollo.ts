import * as express from 'express';
import * as graphql from 'graphql';
import { runQuery } from '../core/runQuery';

import * as GraphiQL from '../modules/renderGraphiQL';

// TODO: will these be the same or different for other integrations?
export interface ExpressApolloOptions {
  schema: graphql.GraphQLSchema;
  formatError?: Function;
  rootValue?: any;
  context?: any;
  logFunction?: Function;
  validationRules?: Array<Function>; // validation rules are functions
  formatResponse?: Function;
}

export interface ExpressApolloOptionsFunction {
  (req?: express.Request): ExpressApolloOptions | Promise<ExpressApolloOptions>;
}

// Design principles:
// - there is just one way allowed: POST request with JSON body. Nothing else.
// - simple, fast and secure
//

export interface ExpressHandler {
  (req: express.Request, res: express.Response, next): void;
}

export function graphqlHTTP(options: ExpressApolloOptions | ExpressApolloOptionsFunction): ExpressHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    // TODO: test this
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length + 1}`);
  }

  return async (req: express.Request, res: express.Response, next) => {
    let optionsObject: ExpressApolloOptions;
    if (isOptionsFunction(options)) {
      optionsObject = await options(req);
    } else {
      optionsObject = options;
    }

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

    const b = req.body;
    // TODO: do something different here if the body is an array.
    // Throw an error if body isn't either array or object.
    const query = b.query;
    const operationName = b.operationName;
    let variables = b.variables;

    if (typeof variables === 'string') {
      // TODO: catch errors
      variables = JSON.parse(variables);
    }

    if (!query) {
      res.status(400);
      res.send('Must provide query string.');
      return;
    }

    return runQuery({
      schema: optionsObject.schema,
      query: query,
      variables: variables,
      rootValue: optionsObject.rootValue,
      operationName: operationName,
      logFunction: optionsObject.logFunction,
      validationRules: optionsObject.validationRules,
      formatError: optionsObject.formatError,
      formatResponse: optionsObject.formatResponse,
    }).then(gqlResponse => {
      res.set('Content-Type', 'application/json');
      if (gqlResponse.errors && typeof gqlResponse.data === 'undefined') {
        res.status(400);
      }
      res.send(JSON.stringify(gqlResponse));
    });
  };
}

function isOptionsFunction(arg: ExpressApolloOptions | ExpressApolloOptionsFunction): arg is ExpressApolloOptionsFunction {
  return typeof arg === 'function';
}

// this returns the html for the GraphiQL interactive query UI
export function renderGraphiQL(options: GraphiQL.GraphiQLData) {
  return (req: express.Request, res: express.Response, next) => {

    const q = req.query || {};
    const query = q.query || '';
    const variables = q.variables || '{}';
    const operationName = q.operationName || '';


    const graphiQLString = GraphiQL.renderGraphiQL({
      location: options.location,
      query: query || options.query,
      variables: JSON.parse(variables) || options.variables,
      operationName: operationName || options.operationName,
    });
    res.set('Content-Type', 'text/html');
    res.send(graphiQLString);
  };
}
