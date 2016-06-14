import * as express from 'express';
import * as graphql from 'graphql';
import { runQuery } from '../core/runQuery';

export interface ExpressBindings {
  schema: graphql.GraphQLSchema;
}

export default function(options: ExpressBindings) {
  if (!options) {
    throw new Error('GraphQL middleware requires options.');
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
      res.send({ data: gqlResponse.data });
    }).catch(gqlResponse => {
      res.send(gqlResponse.errorCode, { errors: gqlResponse.errors });
    });
  };
}
