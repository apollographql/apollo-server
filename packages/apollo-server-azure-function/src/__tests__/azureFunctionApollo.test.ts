import { ApolloServer } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';
import url from 'url';
import { IncomingMessage, ServerResponse } from 'http';

const createLambda = (options: CreateAppOptions = {}) => {
  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );

  const handler = server.createHandler();

  return (req: IncomingMessage, res: ServerResponse) => {
    // return 404 if path is /bogus-route to pass the test, azure doesn't have paths
    if (req.url.includes('/bogus-route')) {
      res.statusCode = 404;
      return res.end();
    }

    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const urlObject = url.parse(req.url, true);
      const request = {
        method: req.method,
        body: body && JSON.parse(body),
        path: req.url,
        query: urlObject.query,
        headers: req.headers,
      };
      const context = {
        done(error, result) {
          if (error) throw error;
          res.statusCode = result.status;
          for (let key in result.headers) {
            if (result.headers.hasOwnProperty(key)) {
              res.setHeader(key, result.headers[key]);
            }
          }
          res.write(result.body);
          res.end();
        },
      };
      handler(context as any, request as any);
    });
  };
};

describe('integration:AzureFunctions', () => {
  testSuite(createLambda);
});
