import * as fastify from 'fastify';
import { FastifyInstance } from 'fastify';
const jsonParser = require('fast-json-body');
import { graphqlFastify, graphiqlFastify } from './fastifyApollo';
import testSuite, {
  schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { expect } from 'chai';
import { GraphQLOptions } from 'apollo-server-core';
import 'mocha';

async function createApp(options: CreateAppOptions = {}) {
  const app = fastify();
  const graphqlOptions = options.graphqlOptions || { schema };

  if (!options.excludeParser) {
    // @ts-ignore: Dynamic addContentTypeParser error
    app.addContentTypeParser('application/json', function(req, done) {
      jsonParser(req, function(err, body) {
        done(err, body);
      });
    });
  }

  if (options.graphiqlOptions) {
    app.register(graphiqlFastify, options.graphiqlOptions);
  }
  app.register(graphqlFastify, { graphqlOptions });

  try {
    await app.listen(3007);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  return app.server;
}

async function destroyApp(app) {
  if (!app || !app.close) {
    return;
  }
  await new Promise(cb => app.close(cb));
}

describe('Fastify', () => {
  describe('fastifyApollo', () => {
    it('throws error if called without schema', function() {
      expect(() =>
        graphqlFastify(
          {} as FastifyInstance,
          undefined as CreateAppOptions,
          undefined,
        ),
      ).to.throw('Apollo Server requires options.');
    });

    it('throws an error if called with argument not equal to 3', function() {
      expect(() => (<any>graphqlFastify)({}, { graphqlOptions: {} })).to.throw(
        'Apollo Server expects exactly 3 argument, got 2',
      );
    });
  });

  describe('integration:Fastify', () => {
    testSuite(createApp, destroyApp);
  });
});
