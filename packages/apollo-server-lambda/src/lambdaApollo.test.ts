import { graphqlLambda, graphiqlLambda } from './lambdaApollo';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { expect } from 'chai';
import { GraphQLOptions } from 'apollo-server-core';
import 'mocha';
import * as url from 'url';

function createLambda(options: CreateAppOptions = {}) {
  let route, handler, callback, event, context;

  options.graphqlOptions = options.graphqlOptions || { schema: Schema };
  if (options.graphiqlOptions) {
    route = '/graphiql';
    handler = graphiqlLambda(options.graphiqlOptions);
  } else {
    route = '/graphql';
    handler = graphqlLambda(options.graphqlOptions);
  }

  return function(req, res) {
    if (!req.url.startsWith(route)) {
      res.statusCode = 404;
      res.end();
      return;
    }

    let body = '';
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
      let urlObject = url.parse(req.url, true);
      event = {
        httpMethod: req.method,
        body: body,
        path: req.url,
        queryStringParameters: urlObject.query,
      };
      context = {};
      callback = function(error, result) {
        res.statusCode = result.statusCode;
        for (let key in result.headers) {
          if (result.headers.hasOwnProperty(key)) {
            res.setHeader(key, result.headers[key]);
          }
        }
        res.write(result.body);
        res.end();
      };

      handler(event, context, callback);
    });
  };
}

describe('lambdaApollo', () => {
  it('throws error if called without schema', function() {
    expect(() => graphqlLambda(undefined as GraphQLOptions)).to.throw(
      'Apollo Server requires options.',
    );
  });

  it('throws an error if called with more than one argument', function() {
    expect(() => (<any>graphqlLambda)({}, {})).to.throw(
      'Apollo Server expects exactly one argument, got 2',
    );
  });
});

describe('integration:Lambda', () => {
  testSuite(createLambda);
});
