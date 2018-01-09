import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from './koaApollo';
import { GraphQLOptions } from 'apollo-server-core';
import { expect } from 'chai';
import * as http from 'http';

import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';

function createApp(options: CreateAppOptions = {}) {
  const app = new koa();
  const router = new koaRouter();

  options.graphqlOptions = options.graphqlOptions || { schema: Schema };

  if (!options.excludeParser) {
    app.use(koaBody());
  }
  if (options.graphiqlOptions) {
    router.get('/graphiql', graphiqlKoa(options.graphiqlOptions));
  }
  router.get('/graphql', graphqlKoa(options.graphqlOptions));
  router.post('/graphql', graphqlKoa(options.graphqlOptions));
  app.use(router.routes());
  app.use(router.allowedMethods());
  return http.createServer(app.callback());
}

function destroyApp(app) {
  app.close();
}

describe('koaApollo', () => {
  it('throws error if called without schema', function() {
    expect(() => graphqlKoa(undefined as GraphQLOptions)).to.throw(
      'Apollo Server requires options.',
    );
  });

  it('throws an error if called with more than one argument', function() {
    expect(() => (<any>graphqlKoa)({}, 'x')).to.throw(
      'Apollo Server expects exactly one argument, got 2',
    );
  });
});

describe('integration:Koa', () => {
  testSuite(createApp, destroyApp);
});
