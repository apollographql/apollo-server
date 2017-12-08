// tslint:disable: variable-name no-var-requires
import { ioc, registrar, resolver } from '@adonisjs/fold';
import { setupResolver, Config } from '@adonisjs/sink';
import { graphqlAdonis, graphiqlAdonis } from './adonisApollo';
import { GraphQLOptions } from 'apollo-server-core';
import { expect } from 'chai';
import testSuite, { schema, CreateAppOptions } from 'apollo-server-integration-testsuite';

const RouteStore = require('@adonisjs/framework/src/Route/Store');

async function createApp(options: CreateAppOptions = {}) {
  ioc.restore();
  RouteStore.clear();
  options.graphqlOptions = options.graphqlOptions || { schema };
  const providers = [
    '@adonisjs/framework/providers/AppProvider',
  ];
  if (!options.excludeParser) {
    providers.push('@adonisjs/bodyparser/providers/BodyParserProvider');
  }
  setupResolver();
  registrar
    .providers(providers)
    .register();
  ioc.bind('Adonis/Src/Config', () => {
    const config = new Config();
    config.set('app', {
      logger: {
        transport: 'console',
        console: {
          driver: 'console',
        },
      },
    });
    return config;
  });

  const Context = ioc.use('Adonis/Src/HttpContext');
  const Request = ioc.use('Adonis/Src/Request');
  const Response = ioc.use('Adonis/Src/Response');
  const Route = ioc.use('Adonis/Src/Route');
  const Server = ioc.use('Adonis/Src/Server');

  Context.getter('request', function () {
    return new Request(this.req, this.res, ioc.use('Adonis/Src/Config'));
  }, true);

  Context.getter('response', function () {
    return new Response(this.req, this.res, ioc.use('Adonis/Src/Config'));
  }, true);

  Route.post('/graphql', graphqlAdonis(options.graphqlOptions));
  Route.get('/graphql', graphqlAdonis(options.graphqlOptions));
  if (options.graphiqlOptions) {
    Route.get('/graphiql', graphiqlAdonis(options.graphiqlOptions));
  }
  if (!options.excludeParser) {
    Server.registerGlobal(['Adonis/Middleware/BodyParser']);
  }
  await new Promise((resolve) => Server.listen('localhost', 3333, resolve));
  return Server.getInstance();
}

async function destroyApp(app) {
  if (!app || !app.close) {
    return;
  }
  await new Promise((resolve) => app.close(resolve));
}

describe('adonisApollo', () => {
  it('throws error if called without schema', function() {
     expect(() => graphqlAdonis(undefined as GraphQLOptions)).to.throw('Apollo Server requires options.');
  });

  it('throws an error if called with more than one argument', function() {
     expect(() => (<any>graphqlAdonis)({}, 'x')).to.throw(
       'Apollo Server expects exactly one argument, got 2');
  });
});

describe('integration:Adonis', () => {
  testSuite(createApp, destroyApp);
});
