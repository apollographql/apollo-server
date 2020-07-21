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
import {
  hashApiKey,
  nockStorageSecret,
  nockGoodManifestsUnderStorageSecret,
  genericStorageSecret,
} from './helpers.test-helpers';
import { Headers } from 'apollo-server-env';
import { GraphQLRequest } from 'apollo-server-plugin-base';
import { EngineReportingOptions } from 'apollo-engine-reporting';

// While not ideal, today, Apollo Server has a very real expectation of an HTTP
// request context.  That will change in the future.  While we can sometimes
// make by without it, that is no longer the case when Engine Reporting is
// enabled since it relies on the HTTP "method" property of the HTTP context
// when building the traces.  Therefore, we'll need to make sure that we provide
// a fake HTTP context to `executeOperation` when testing with Engine enabled,
// to ensure that it doesn't fail.
const mockHttpRequestContextForExecuteOperation: Required<Pick<
  GraphQLRequest,
  'http'
>> = {
  http: { method: 'GET', headers: new Headers(), url: '/mocked' },
};

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
    const engineOptions: EngineReportingOptions<any> = {
      apiKey,
      reportTiming: false,
    };
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
        nockStorageSecret(graphId, hashedApiKey);
        nockGoodManifestsUnderStorageSecret(
          graphId,
          genericStorageSecret,
          [ /* Intentionally empty! */ ],
        );
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: engineOptions,
          plugins: [
            plugin({
              onUnregisteredOperation,
            })(),
          ],
        });
        await server.willStart();
        const result = await server.executeOperation({
          ...mockHttpRequestContextForExecuteOperation,
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
        nockStorageSecret(graphId, hashedApiKey);
        nockGoodManifestsUnderStorageSecret(
          graphId,
          genericStorageSecret,
          [
            {
              document: normalizedQueryDocument,
              signature: queryHash,
            },
          ],
        );
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: engineOptions,
          plugins: [
            plugin({
              onUnregisteredOperation,
            })(),
          ],
        });
        await server.willStart();
        const result = await server.executeOperation({
          ...mockHttpRequestContextForExecuteOperation,
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
        nockStorageSecret(graphId, hashedApiKey);
        nockGoodManifestsUnderStorageSecret(
          graphId,
          genericStorageSecret,
          [ /* Intentionally empty! */ ],
        );
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: engineOptions,
          plugins: [
            plugin({
              forbidUnregisteredOperations,
              onForbiddenOperation,
            })(),
          ],
        });
        await server.willStart();
        const result = await server.executeOperation({
          ...mockHttpRequestContextForExecuteOperation,
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
        nockStorageSecret(graphId, hashedApiKey);
        nockGoodManifestsUnderStorageSecret(
          graphId,
          genericStorageSecret,
          [ /* Intentionally empty! */ ],
        );
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: engineOptions,
          plugins: [
            plugin({
              forbidUnregisteredOperations,
              onForbiddenOperation,
            })(),
          ],
        });
        await server.willStart();
        const result = await server.executeOperation({
          ...mockHttpRequestContextForExecuteOperation,
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
        nockStorageSecret(graphId, hashedApiKey);
        nockGoodManifestsUnderStorageSecret(
          graphId,
          genericStorageSecret,
          [
            {
              document: normalizedQueryDocument,
              signature: queryHash,
            },
          ],
        );
        const server = new ApolloServerMock({
          typeDefs,
          mockEntireSchema: true,
          engine: engineOptions,
          plugins: [
            plugin({
              onForbiddenOperation,
            })(),
          ],
        });
        await server.willStart();
        const result = await server.executeOperation({
          ...mockHttpRequestContextForExecuteOperation,
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
