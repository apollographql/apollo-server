import { ApolloServerStandalone } from '../../standalone';

// one with and without context function
describe('FIXME', () => {
  it('', () => {
    const server = new ApolloServerStandalone({
      typeDefs: `type Query { foo: String}`,
    });
  });

  it('', () => {
    interface MyContext {
      foo: string;
    }
    const server = new ApolloServerStandalone({
      typeDefs: `type Query { foo: String}`,
      async context() {
        return {
          foo: 'bar',
        } as MyContext;
      },
    });
  });
});
