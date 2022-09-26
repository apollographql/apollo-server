import { ApolloServer } from '@apollo/server';
import assert from 'assert';

const s = new ApolloServer({
  typeDefs: 'type Query {hello:String}',
  resolvers: {
    Query: {
      hello() {
        return 'world';
      },
    },
  },
});
const { body } = await s.executeOperation({ query: '{hello}' });

assert.strictEqual(body.kind, 'single');
assert.strictEqual(body.singleResult.data.hello, 'world');

await s.stop();

console.log('Non-Express smoke test passed!');
