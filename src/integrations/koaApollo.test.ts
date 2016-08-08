import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import { apolloKoa, graphiqlKoa } from './koaApollo';
import ApolloOptions from './apolloOptions';
import { expect } from 'chai';
import * as http from 'http';

import testSuite, { Schema, CreateAppOptions } from './integrations.test';

function createApp(options: CreateAppOptions = {}) {
  const app = new koa();
  const router = new koaRouter();

  options.apolloOptions = options.apolloOptions || { schema: Schema };

  if (!options.excludeParser) {
    app.use(koaBody());
  }
  if (options.graphiqlOptions ) {
    router.get('/graphiql', graphiqlKoa( options.graphiqlOptions ));
  }
  router.post('/graphql', apolloKoa( options.apolloOptions ));
  app.use(router.routes());
  app.use(router.allowedMethods());
  return http.createServer(app.callback());
}

function destroyApp(app) {
  app.close();
}

describe('koaApollo', () => {
  it('throws error if called without schema', function(){
     expect(() => apolloKoa(undefined as ApolloOptions)).to.throw('Apollo Server requires options.');
  });

  it('throws an error if called with more than one argument', function(){
     expect(() => (<any>apolloKoa)({}, 'x')).to.throw(
       'Apollo Server expects exactly one argument, got 2');
  });
});

describe('integration:Koa', () => {
  testSuite(createApp, destroyApp);
});
