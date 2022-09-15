import express from 'express';
import request from 'supertest';
import { ApolloServer } from '../../index.js';
import { expressMiddleware } from '../../express4/index.js';
import { it, expect } from '@jest/globals';

it('gives helpful error if body-parser middleware is not installed', async () => {
  const server = new ApolloServer({ typeDefs: 'type Query {f: ID}' });
  await server.start();
  const app = express();
  // Note lack of `json` here.
  app.use(expressMiddleware(server));

  await request(app)
    .post('/')
    .send({ query: '{hello}' })
    .expect(500, /forgot to set up the `body-parser`/);
  await server.stop();
});

it('not calling start causes a clear error', async () => {
  const server = new ApolloServer({ typeDefs: 'type Query {f: ID}' });
  expect(() => expressMiddleware(server)).toThrow(
    'You must `await server.start()`',
  );
});
