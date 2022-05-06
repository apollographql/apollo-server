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
      resolvers: {
        Query: {
          foo: (_, __, context) => {
            return context;
          },
        }
      }
      async context(): Promise<MyContext> {
        return {
          foo: 'bar',
        };
      },
    });
  });
});
