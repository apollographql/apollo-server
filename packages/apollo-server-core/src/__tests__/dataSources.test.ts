import { ApolloServerBase } from '../ApolloServer';
import gql from 'graphql-tag';

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello() {
      return 'world';
    }
  },
};

describe('ApolloServerBase dataSources', () => {
  it('initializes synchronous datasources from a datasource creator function', async () => {
    const initialize = jest.fn();

    const server = new ApolloServerBase({
      typeDefs,
      resolvers,
      dataSources: () => ({ x: { initialize }, y: { initialize } })
    });

    await server.executeOperation({ query: "query { hello }"});

    expect(initialize).toHaveBeenCalledTimes(2);
  });

  it('initializes asynchronous datasources before calling resolvers', async () => {
    const expectedMessage = 'success';
    let maybeInitialized = 'failure';

    const additionalInitializer = jest.fn();

    const server = new ApolloServerBase({
      typeDefs,
      resolvers: {
        Query: {
          hello(_, __, context) {
            return context.dataSources.x.getData();
          }
        },
      },
      dataSources: () => ({
        x: {
          initialize() {
            return new Promise(res => { setTimeout(() => {
              maybeInitialized = expectedMessage;
              res();
            }, 200) })
          },
          getData() { return maybeInitialized; }
        },
        y: {
          initialize() {
            return new Promise(res => { setTimeout(() => {
              additionalInitializer();
              res();
            }, 400) })
          }
        }
      })
    });

    const res = await server.executeOperation({ query: "query { hello }"});

    expect(res.data?.hello).toBe(expectedMessage);
    expect(additionalInitializer).toHaveBeenCalled();
  });

  it('make datasources available on resolver contexts', async () => {
    const message = 'hi from dataSource';
    const getData = jest.fn(() => message);

    const server = new ApolloServerBase({
      typeDefs,
      resolvers: {
        Query: {
          hello(_, __, context) {
            return context.dataSources.x.getData();
          }
        },
      },
      dataSources: () => ({ x: { initialize() {}, getData } })
    });

    const res = await server.executeOperation({ query: "query { hello }"});

    expect(getData).toHaveBeenCalled();
    expect(res.data?.hello).toBe(message);
  });
});
