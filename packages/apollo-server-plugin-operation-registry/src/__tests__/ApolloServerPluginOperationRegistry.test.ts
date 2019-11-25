import plugin, { Options } from '../ApolloServerPluginOperationRegistry';
import { ApolloServerBase } from 'apollo-server-core';
import {
  /**
   * We alias these to different names entirely since the user-facing values
   * which are present in their manifest (signature and document) are probably
   * the most important concepts to rally around right now, in terms of
   * approachability to the implementor.  A future version of the
   * `apollo-graphql` package should rename them to make this more clear.
   */
  defaultOperationRegistrySignature as defaultOperationRegistryNormalization,
  operationHash as operationSignature,
} from 'apollo-graphql';
import gql from 'graphql-tag';
import { print } from 'graphql';
import { hashApiKey } from "./helpers.test-helpers";

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
    const graphId = 'test-service';
    const apiKey = `service:${graphId}:not-an-api-key`;
    const hashedApiKey = hashApiKey(apiKey);
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

    const normalizedQueryDocument = defaultOperationRegistryNormalization(
      query,
      'HelloFam',
    );
    const queryHash = operationSignature(normalizedQueryDocument);

    // In order to expose will start and
    class ApolloServerMock extends ApolloServerBase {
      public async willStart() {
        return super.willStart();
      }
    }

    describe('onUnregisterOperation', () => {
      it('is called when unregistered operation received', async () => {
        const onUnregisteredOperation: Options['onUnregisteredOperation'] = jest.fn();
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: {
            apiKey,
            sendReportsImmediately: true,
          },
          plugins: [
            plugin({
              willUpdateManifest: () => {
                return {
                  version: 2,
                  operations: [],
                };
              },
              onUnregisteredOperation,
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
        expect(onUnregisteredOperation).toHaveBeenCalledTimes(1);
        expect(onUnregisteredOperation).toHaveBeenCalledWith(
          // First argument: request pipeline context.
          expect.objectContaining({
            request: expect.objectContaining({
              operationName: 'HelloFam',
            }),
          }),

          // Second argument: operation registry context.
          expect.objectContaining({
            signature: expect.stringMatching(/^[a-f0-9]+$/),
            normalizedDocument: expect.stringMatching(/^query HelloFam/)
          }),
        );
        await server.stop();
      });

      it('is not called when registered operation received', async () => {
        const onUnregisteredOperation: Options['onUnregisteredOperation'] = jest.fn();
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: {
            apiKey,
            sendReportsImmediately: true,
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
              onUnregisteredOperation,
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
        expect(onUnregisteredOperation).toHaveBeenCalledTimes(0);
        await server.stop();
      });
    });

    describe('onForbiddenOperation', () => {
      it('is called when unregistered operation received and forbidden', async () => {
        const onForbiddenOperation = jest.fn();

        // Returning true from this predicate enables the enforcement.
        const forbidUnregisteredOperations = jest.fn(() => true);

        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: {
            apiKey,
            sendReportsImmediately: true,
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
              onForbiddenOperation,
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
        expect(onForbiddenOperation).toHaveBeenCalledTimes(1);
        expect(onForbiddenOperation).toHaveBeenCalledWith(
          // First argument: request pipeline context.
          expect.objectContaining({
            request: expect.objectContaining({
              operationName: 'HelloFam',
            }),
          }),

          // Second argument: operation registry context.
          expect.objectContaining({
            signature: expect.stringMatching(/^[a-f0-9]+$/),
            normalizedDocument: expect.stringMatching(/^query HelloFam/)
          }),
        );
        expect(forbidUnregisteredOperations).toHaveBeenCalledTimes(1);
        await server.stop();
      });

      it('is not called when unregistered operation received and unforbidden', async () => {
        const onForbiddenOperation = jest.fn();

        // Returning true from this predicate enables the enforcement.
        const forbidUnregisteredOperations = jest.fn(() => false);
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: {
            apiKey,
            sendReportsImmediately: true,
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
              onForbiddenOperation,
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
        expect(onForbiddenOperation).toHaveBeenCalledTimes(0);
        expect(forbidUnregisteredOperations).toHaveBeenCalledTimes(1);
        await server.stop();
      });

      it('is not called when registered operation received', async () => {
        const onForbiddenOperation = jest.fn();
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: {
            apiKey,
            sendReportsImmediately: true,
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
              onForbiddenOperation,
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
        expect(onForbiddenOperation).toHaveBeenCalledTimes(0);
        await server.stop();
      });
    });
  });
});
