import { fastifyGraphql } from './fastifyApollo';
import 'mocha';

import * as fastify from "fastify";
import testSuite, { schema, CreateAppOptions  } from 'apollo-server-integration-testsuite';

const app = fastify();

function createApp(options: CreateAppOptions) {
  return app.register(fastifyGraphql);
}

describe('integration:Fastify', () => {
  testSuite(createApp);
});
