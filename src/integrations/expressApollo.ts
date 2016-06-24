import * as express from 'express';
import * as graphql from 'graphql';
import { runQuery } from '../core/runQuery';

import * as GraphiQL from '../modules/renderGraphiQL';

import httpError from 'http-errors';

// TODO: will these be the same or different for other integrations?
export interface ExpressApolloOptions {
  schema: graphql.GraphQLSchema;
  formatError?: Function;
  rootValue?: any;
  context?: any;
  logFunction?: Function;
  // pretty?: boolean;
  // TODO: does this need to be able to take a promise as well, like express-graphql does?
  // answer: yes, it does. Func(req) => options
}

export interface ExpressApolloOptionsFunction {
  (req?: express.Request): ExpressApolloOptions;
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

  return (req: express.Request, res: express.Response, next) => {
    let optionsObject: ExpressApolloOptions;
    if (isOptionsFunction(options)) {
      optionsObject = options(req);
    } else {
      optionsObject = options;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      throw httpError(405, 'Apollo Server supports only POST requests for GraphQL.');
    }

    // TODO: some sanity checks here.
    const { query, variables, operationName } = req.body;

    // either query or operationName must be present. Return 400 otherwise
    // if only operationName is present, check if it's in store. Return 400 otherwise

    // TODO: in store, fragments should only have to be written once, then used across queries.

    return runQuery({
      schema: optionsObject.schema,
      query: query,
      variables: variables,
      rootValue: optionsObject.rootValue,
      operationName: operationName,
    }).then(gqlResponse => {
      res.set('Content-Type', 'application/json');
      if (gqlResponse.errors && !gqlResponse.data) {
        res.status(400);
      }
      const response = {
        data: gqlResponse.data,
      };
      if (gqlResponse.errors) {
        response['errors'] = gqlResponse.errors.map(graphql.formatError);
      }
      res.send(JSON.stringify(response));
    });
  };
}

function isOptionsFunction(arg: ExpressApolloOptions | ExpressApolloOptionsFunction): arg is ExpressApolloOptionsFunction {
  return typeof arg === 'function';
}

// this returns the html for the GraphiQL interactive query UI
// TODO: it's still missing a way to tell it where the GraphQL endpoint is.
export function renderGraphiQL(options: GraphiQL.GraphiQLData) {
  return (req: express.Request, res: express.Response, next) => {
    const graphiQLString = GraphiQL.renderGraphiQL({
      query: options.query,
      variables: options.variables,
      operationName: options.operationName,
      result: options.result,
    });
    res.set('Content-Type', 'text/html');
    res.send(graphiQLString);
  };
}
