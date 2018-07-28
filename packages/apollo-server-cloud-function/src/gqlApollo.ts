import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
} from 'apollo-server-core';
import { Headers } from 'apollo-server-env';

export function graphqlCloudFunction(options: GraphQLOptions): any {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler: any = (req, res): void => {
    if (req.method === 'POST' && !req.body) {
      res.status(500).send('POST body missing.');
      return;
    }

    runHttpQuery([req, res], {
      method: req.method,
      options: options,
      query: req.method === 'POST' ? req.body : (req.query as any),
      request: {
        url: req.url,
        method: req.method,
        headers: new Headers(req.headers), // ? Check if this actually works
      },
    }).then(
      ({ graphqlResponse, responseInit }) => {
        res
          .status(200)
          .set(responseInit.headers)
          .send(graphqlResponse);
      },
      (error: HttpQueryError) => {
        console.log('Error!');
        console.log(JSON.stringify(error));
        if ('HttpQueryError' !== error.name) {
          res.status(500).send(error);
          return;
        }
        console.log('other error');
        console.log(JSON.stringify(error));
        res
          .status(error.statusCode)
          .set(error.headers)
          .send(error.message);
      },
    );
  };

  return graphqlHandler;
}
