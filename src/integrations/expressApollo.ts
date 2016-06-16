import * as express from 'express';
import * as graphql from 'graphql';
import { runQuery } from '../core/runQuery';

import { renderGraphiQL, GraphiQLData } from '../modules/renderGraphiQL';

// TODO: will these be the same or different for other integrations?
export interface ExpressApolloOptions {
  schema: graphql.GraphQLSchema;
  formatError?: Function;
  rootValue?: any;
  context?: any;
  logFunction?: Function;
  // TODO: does this need to be able to take a promise as well, like express-graphql does?
  // answer: yes, it does. Func(req) => options
}

export function graphqlHTTP(options: ExpressApolloOptions) {
  if (!options) {
    throw new Error('Apollo graphqlHTTP middleware requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(`apolloServer expects exactly one argument, got ${arguments.length + 1}`);
  }

  return (req: express.Request, res: express.Response, next) => {
    runQuery({
      schema: options.schema,
      query: req.body,
    }).then(gqlResponse => {
      res.set('Content-Type', 'application/json');
      res.send({ data: gqlResponse.data, errors: gqlResponse.errors });
    });
  };
}

// this returns the html for the GraphiQL interactive query UI
// TODO: it's still missing a way to tell it where the GraphQL endpoint is.
export function renderGraphiQL(options: GraphiQLData) {
  return (req: express.Request, res: express.Response, next) => {
    const graphiQLString = renderGraphiQL({
      query: options.query,
      variables: options.variables,
      operationName: options.operationName,
      result: options.result,
    });
    res.set('Content-Type', 'text/html');
    res.send(graphiQLString);
  };
}
