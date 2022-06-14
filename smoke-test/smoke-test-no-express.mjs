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
const { result } = await s.executeOperation({ query: '{hello}' });

assert.strictEqual(result.data.hello, 'world');

await s.stop();

console.log('Non-Express smoke test passed!');
