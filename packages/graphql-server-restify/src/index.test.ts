import 'mocha';
import * as restify from 'restify';
import { expect } from 'chai';
import testSuite, { Schema, CreateAppOptions } from 'graphql-server-integration-testsuite';
import { GraphQLOptions } from 'graphql-server-core';

import { graphqlRestify, graphiqlRestify } from './';

// tslint:disable-next-line
const request = require('supertest-as-promised');

function createApp(options: CreateAppOptions = {}) {
  const server = restify.createServer({
    name: 'Restify Test Server',
  });

  options.graphqlOptions = options.graphqlOptions || { schema: Schema };
  if (!options.excludeParser) {
    server.use(restify.bodyParser());
  }
  if (options.graphiqlOptions ) {
    server.get('/graphiql', graphiqlRestify( options.graphiqlOptions ));
  }
  server.post('/graphql', graphqlRestify( options.graphqlOptions ));
  return server;
}

describe('graphqlRestify', () => {
  it('throws error if called without schema', () => {
     expect(() => graphqlRestify(undefined as GraphQLOptions)).to.throw('Apollo Server requires options.');
  });

  it('throws an error if called with more than one argument', () => {
     expect(() => (<any>graphqlRestify)({}, 'x')).to.throw(
       'Apollo Server expects exactly one argument, got 2');
  });

  it('generates a function if the options are ok', () => {
    expect(() => graphqlRestify({ schema: Schema })).to.be.a('function');
  });

  it('throws an error if POST body is not an object or array', () => {
      const app = createApp();
      const req = request(app)
          .post('/graphql')
          .send('123');
      return req.then((res) => {
          expect(res.status).to.equal(500);
          return expect(res.error.text).to.contain('Invalid POST body sent');
      });
  });
});

describe('integration:Restify', () => {
  testSuite(createApp);
});
