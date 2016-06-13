import * as express from 'express';
import * as graphql from 'graphql';
// TODO: can be removed after tests are actually writen
/* tslint:disable:no-unused-variable */
import runQuery from '../core/runQuery';

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
        // const gqlResponse = runQuery(options.schema)
        //
        // res.set('Content-Type', 'application/json');
        // if (gqlResponse.errors) {
        //     res.send(gqlResponse.errorCode, { errors: gqlResponse.errors })
        // } else {
        //     res.send({ data: gqlResponse.data })
        // }
    };
}
