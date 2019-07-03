import plugin from '../ApolloServerPluginOperationRegistry';
import { ApolloServerBase, ForbiddenError } from 'apollo-server-core';
import {
  defaultOperationRegistrySignature,
  operationHash,
} from 'apollo-graphql';
import gql from 'graphql-tag';
import { print } from 'graphql';

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const query = gql`
  query HelloFam {
    hello
  }
`;

const normalizedQueryDocument = defaultOperationRegistrySignature(
  query,
  'HelloFam',
);
const queryHash = operationHash(normalizedQueryDocument);

// In order to expose will start and
class ApolloServerMock extends ApolloServerBase {
  public async willStart() {
    return super.willStart();
  }
}

describe('Operation registry plugin', () => {
  it('will instantiate when not called with options', () => {
    expect(plugin()()).toHaveProperty('serverWillStart');
  });

  it('will instantiate with debug enabled', () => {
    expect(plugin({ debug: true })()).toHaveProperty('serverWillStart');
  });

  // These tests depend on the behavior of willUpdateManifest to update the
  // operation safelist
  describe('operation lifecycle hooks', () => {
    describe('onUnregisterOperation', () => {
      it('is called when unregistered operation received', async () => {
        const mock = jest.fn(requestContext => {
          expect(requestContext).toMatchObject({
            request: {
              operationName: 'HelloFam',
            },
          });
        });
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: {
            apiKey: 'server:not-a-service:not-an-apikey',
          },
          plugins: [
            plugin({
              willUpdateManifest: () => {
                return {
                  version: 2,
                  operations: [],
                };
              },
              onUnregisteredOperation: mock,
            })(),
          ],
        });
        await server.willStart();
        const result = await server.executeOperation({
          query: print(query),
          operationName: 'HelloFam',
        });
        expect(result.data).toBeDefined();
        expect(result.errors).not.toBeDefined();
        expect(result.data && result.data.hello).toBeDefined();
        expect(mock).toHaveBeenCalledTimes(1);
        await server.stop();
      });

      it('is not called when registered operation received', async () => {
        const mock = jest.fn();
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: {
            apiKey: 'server:not-a-service:not-an-apikey',
          },
          plugins: [
            plugin({
              willUpdateManifest: () => {
                return {
                  version: 2,
                  operations: [
                    {
                      document: normalizedQueryDocument,
                      signature: queryHash,
                    },
                  ],
                };
              },
              onUnregisteredOperation: mock,
            })(),
          ],
        });
        await server.willStart();
        const result = await server.executeOperation({
          query: print(query),
          operationName: 'HelloFam',
        });
        expect(result.data).toBeDefined();
        expect(result.errors).not.toBeDefined();
        expect(result.data && result.data.hello).toBeDefined();
        expect(mock).toHaveBeenCalledTimes(0);
        await server.stop();
      });
    });

    describe('onForbiddenOperation', () => {
      it('is called when unregistered operation received and forbidden', async () => {
        const mock = jest.fn(requestContext => {
          expect(requestContext).toMatchObject({
            request: {
              operationName: 'HelloFam',
            },
          });
        });
        const forbidUnregisteredOperations = jest.fn(requestContext => {
          expect(requestContext).toMatchObject({
            request: {
              operationName: 'HelloFam',
            },
          });
          return true;
        });

        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: {
            apiKey: 'server:not-a-service:not-an-apikey',
          },
          plugins: [
            plugin({
              willUpdateManifest: () => {
                return {
                  version: 2,
                  operations: [],
                };
              },
              forbidUnregisteredOperations,
              onForbiddenOperation: mock,
            })(),
          ],
        });
        await server.willStart();
        const result = await server.executeOperation({
          query: print(query),
          operationName: 'HelloFam',
        });
        expect(result.data).not.toBeDefined();
        expect(result.errors).toBeDefined();
        expect(result.errors).toHaveLength(1);
        expect(result.errors && result.errors[0].message).toContain(
          'forbidden',
        );
        expect(mock).toHaveBeenCalledTimes(1);
        expect(forbidUnregisteredOperations).toHaveBeenCalledTimes(1);
        await server.stop();
      });

      it('is not called when unregistered operation received and unforbidden', async () => {
        const mock = jest.fn(requestContext => {
          expect(requestContext).toMatchObject({
            request: {
              operationName: 'HelloFam',
            },
          });
        });
        const forbidUnregisteredOperations = jest.fn(requestContext => {
          expect(requestContext).toMatchObject({
            request: {
              operationName: 'HelloFam',
            },
          });
          return false;
        });
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: {
            apiKey: 'server:not-a-service:not-an-apikey',
          },
          plugins: [
            plugin({
              willUpdateManifest: () => {
                return {
                  version: 2,
                  operations: [],
                };
              },
              forbidUnregisteredOperations,
              onForbiddenOperation: mock,
            })(),
          ],
        });
        await server.willStart();
        const result = await server.executeOperation({
          query: print(query),
          operationName: 'HelloFam',
        });
        expect(result.data).toBeDefined();
        expect(result.errors).not.toBeDefined();
        expect(result.data && result.data.hello).toBeDefined();
        expect(mock).toHaveBeenCalledTimes(0);
        expect(forbidUnregisteredOperations).toHaveBeenCalledTimes(1);
        await server.stop();
      });

      it('is not called when registered operation received', async () => {
        const mock = jest.fn();
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: {
            apiKey: 'server:not-a-service:not-an-apikey',
          },
          plugins: [
            plugin({
              willUpdateManifest: () => {
                return {
                  version: 2,
                  operations: [
                    {
                      document: normalizedQueryDocument,
                      signature: queryHash,
                    },
                  ],
                };
              },
              onForbiddenOperation: mock,
            })(),
          ],
        });
        await server.willStart();
        const result = await server.executeOperation({
          query: print(query),
          operationName: 'HelloFam',
        });
        expect(result.data).toBeDefined();
        expect(result.errors).not.toBeDefined();
        expect(result.data && result.data.hello).toBeDefined();
        expect(mock).toHaveBeenCalledTimes(0);
        await server.stop();
      });
    });
  });
});
