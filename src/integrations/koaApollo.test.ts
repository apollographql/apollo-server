import {
  assert,
  expect,
} from 'chai';

// tslint:disable-next-line
const request = require('supertest-as-promised');

// tslint:disable-next-line
import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import ApolloOptions from './apolloOptions';
import { apolloKoa, graphiqlKoa } from './koaApollo';

import { OperationStore } from '../modules/operationStore';
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
  return app.listen(3000);
}

function destroyApp(app) {
  app.close();
}

describe('graphqlHTTP', () => {
   it('returns express middleware', () => {
      const middleware = apolloKoa({
          schema: Schema,
      });
      assert.typeOf(middleware, 'function');
  });
  it('throws error if called without schema', () => {
     expect(() => apolloKoa(undefined as ApolloOptions)).to.throw('Apollo Server requires options.');
  });
});

describe('renderGraphiQL', () => {
  it('returns express middleware', () => {
      const query = `{ testString }`;
      const middleware = graphiqlKoa({
          endpointURL: '/graphql',
          query: query,
      });
      assert.typeOf(middleware, 'function');
  });
});

describe('integration:Koa', () => {
  testSuite(createApp, destroyApp);
});
