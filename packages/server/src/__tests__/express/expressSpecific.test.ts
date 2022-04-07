import express from 'express';
import request from 'supertest';
import { ApolloServer } from '../..';
import { expressMiddleware } from '../../express';

it('gives helpful error if body-parser middleware is not installed', async () => {
  const server = new ApolloServer({ typeDefs: 'type Query {f: ID}' });
  await server.start();
  const app = express();
  // Note lack of `json` here.
  app.use('/graphql', expressMiddleware(server));

  await request(app)
    .post('/graphql')
    .send({ query: '{hello}' })
    .expect(500, /forgot to set up the `body-parser`/);
  await server.stop();
});
