import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import { apolloKoa, graphiqlKoa } from './koaApollo';

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

describe('integration:Koa', () => {
  testSuite(createApp, destroyApp);
});
