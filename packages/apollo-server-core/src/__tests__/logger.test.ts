import { ApolloServerBase } from '../..';
import gql from 'graphql-tag';
import loglevel from 'loglevel';

const KNOWN_DEBUG_MESSAGE = 'The server is starting.';

describe('logger', () => {
  it('uses internal loglevel logger by default', async () => {
    const server = new ApolloServerBase({
      typeDefs: gql`
        type Query {
          field: String!
        }
      `,
      plugins: [
        {
          async serverWillStart({ logger }) {
            logger.debug(KNOWN_DEBUG_MESSAGE);
          },
        },
      ],
    });

    const defaultLogger = server['logger'] as loglevel.Logger;
    const debugSpy = jest.spyOn(defaultLogger, 'debug');
    await server.start();

    expect(debugSpy).toHaveBeenCalledWith(KNOWN_DEBUG_MESSAGE);
    expect(defaultLogger.levels).toEqual(loglevel.levels);
  });

  it('uses custom logger when configured', async () => {
    const debugSpy = jest.fn();
    const server = new ApolloServerBase({
      typeDefs: gql`
        type Query {
          field: String!
        }
      `,
      plugins: [
        {
          async serverWillStart({ logger }) {
            logger.debug(KNOWN_DEBUG_MESSAGE);
          },
        },
      ],
      logger: {
        debug: debugSpy,
        info: () => {},
        warn: () => {},
        error: () => {},
      },
    });

    await server.start();
    expect(debugSpy).toHaveBeenCalledWith(KNOWN_DEBUG_MESSAGE);
  });
});
