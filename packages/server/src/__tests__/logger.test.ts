import { ApolloServer } from '..';
import gql from 'graphql-tag';
import loglevel from 'loglevel';
import { mockLogger } from './mockLogger';
import { jest, describe, it, expect } from '@jest/globals';

const KNOWN_DEBUG_MESSAGE = 'The server is starting.';

describe('logger', () => {
  it('uses internal loglevel logger by default', async () => {
    const server = new ApolloServer({
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

    const defaultLogger = server.logger as loglevel.Logger;
    const debugSpy = jest.spyOn(defaultLogger, 'debug');
    await server.start();

    expect(debugSpy).toHaveBeenCalledWith(KNOWN_DEBUG_MESSAGE);
    // checking the logger is the one from `loglevel`, we can't instance check
    // this since loglevel doesn't uses classes.
    expect(defaultLogger.levels).toEqual(loglevel.levels);
  });

  it('uses custom logger when configured', async () => {
    const logger = mockLogger();
    const server = new ApolloServer({
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
      logger,
    });

    await server.start();
    expect(logger.debug).toHaveBeenCalledWith(KNOWN_DEBUG_MESSAGE);
  });
});
