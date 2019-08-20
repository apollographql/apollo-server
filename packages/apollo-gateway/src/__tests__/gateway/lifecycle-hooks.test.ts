import {
  ApolloGateway,
  GatewayConfig,
  UpdateServiceDefinitions,
  DidUpdateCompositionCallback,
} from '../../index';
import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

const services = [product, reviews, inventory, accounts, books];
const serviceDefinitions = services.map((s, i) => ({
  name: s.name,
  typeDefs: s.typeDefs,
  url: `http://localhost:${i}`,
}));

describe('lifecycle hooks', () => {
  it('uses updateServiceDefinitions override', async () => {
    const experimental_updateServiceDefinitions: UpdateServiceDefinitions = jest.fn(
      async (_config: GatewayConfig) => {
        return { serviceDefinitions, isNewSchema: true };
      },
    );

    const gateway = new ApolloGateway({
      serviceList: serviceDefinitions,
      experimental_updateServiceDefinitions,
      experimental_didUpdateComposition: jest.fn(),
    });

    await gateway.load();

    expect(experimental_updateServiceDefinitions).toBeCalled();
    expect(gateway.schema!.getType('Furniture')).toBeDefined();
  });

  it('calls experimental_didFailComposition with a bad config', async done => {
    const experimental_didFailComposition = jest.fn();

    const gateway = new ApolloGateway({
      async experimental_updateServiceDefinitions(_config: GatewayConfig) {
        return {
          serviceDefinitions: [serviceDefinitions[0]],
          compositionMetadata: {
            formatVersion: 1,
            id: 'abc',
            implementingServiceLocations: [],
            schemaHash: 'abc',
          },
          isNewSchema: true,
        };
      },
      experimental_didFailComposition,
    });

    try {
      await gateway.load();
    } catch {}

    const callbackArgs = experimental_didFailComposition.mock.calls[0][0];
    expect(callbackArgs.serviceList).toHaveLength(1);
    expect(callbackArgs.errors[0]).toMatchInlineSnapshot(
      `[GraphQLError: [product] Book -> \`Book\` is an extension type, but \`Book\` is not defined in any service]`,
    );
    expect(callbackArgs.compositionMetadata.id).toEqual('abc');
    expect(experimental_didFailComposition).toBeCalled();
    done();
  });

  it('calls experimental_didUpdateComposition on schema update', async () => {
    jest.useFakeTimers();

    const compositionMetadata = {
      formatVersion: 1,
      id: 'abc',
      implementingServiceLocations: [],
      schemaHash: 'hash1',
    };

    const update: UpdateServiceDefinitions = async (
      _config: GatewayConfig,
    ) => ({
      serviceDefinitions,
      isNewSchema: true,
      compositionMetadata: {
        ...compositionMetadata,
        id: '123',
        schemaHash: 'hash2',
      },
    });

    // This is the simplest way I could find to achieve mocked functions that leverage our types
    const mockUpdate = jest.fn(update);

    // We want to return a different composition across two ticks, so we mock it
    // slightly differenty
    mockUpdate.mockImplementationOnce(async (_config: GatewayConfig) => {
      const services = serviceDefinitions.filter(s => s.name !== 'books');
      return {
        serviceDefinitions: [
          ...services,
          {
            name: 'book',
            typeDefs: books.typeDefs,
            url: 'http://localhost:32542',
          },
        ],
        isNewSchema: true,
        compositionMetadata,
      };
    });

    const didUpdate: DidUpdateCompositionCallback = () => {};
    const mockDidUpdate = jest.fn(didUpdate);

    const gateway = new ApolloGateway({
      experimental_updateServiceDefinitions: mockUpdate,
      experimental_didUpdateComposition: mockDidUpdate,
      experimental_pollInterval: 10,
    });

    await gateway.load();

    expect(mockUpdate).toBeCalledTimes(1);
    expect(mockDidUpdate).toBeCalledTimes(1);

    jest.runOnlyPendingTimers();
    // XXX This allows the ApolloGateway.updateComposition() Promise to resolve
    // after the poll ticks, and is necessary for allowing mockDidUpdate to see the expected calls.
    await Promise.resolve();

    expect(mockUpdate).toBeCalledTimes(2);
    expect(mockDidUpdate).toBeCalledTimes(2);

    const [firstCall, secondCall] = mockDidUpdate.mock.calls;

    expect(firstCall[0]!.schema).toBeDefined();
    expect(firstCall[0].compositionMetadata!.schemaHash).toEqual('hash1');
    // first call should have no second "previous" argument
    expect(firstCall[1]).toBeUndefined();

    expect(secondCall[0].schema).toBeDefined();
    expect(secondCall[0].compositionMetadata!.schemaHash).toEqual('hash2');
    // second call should have previous info in the second arg
    expect(secondCall[1]!.schema).toBeDefined();
    expect(secondCall[1]!.compositionMetadata!.schemaHash).toEqual('hash1');

    jest.useRealTimers();
  });

  it('uses default service definition updater', async () => {
    const gateway = new ApolloGateway({
      localServiceList: serviceDefinitions,
    });

    const { schema } = await gateway.load();

    // spying on gateway.loadServiceDefinitions wasn't working, so this also
    // should test functionality. If there's no overwriting service definition
    // updater, it has to use the default. If there's a valid schema, then
    // the loader had to have been called.
    expect(schema.getType('User')).toBeDefined();
  });

  it('warns when polling on the default fetcher', async () => {
    const consoleSpy = jest.spyOn(console, 'warn');
    new ApolloGateway({
      serviceList: serviceDefinitions,
      experimental_pollInterval: 10,
    });
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0][0]).toMatch(
      'Polling running services is dangerous and not recommended in production. Polling should only be used against a registry. If you are polling running services, use with caution.',
    );
    consoleSpy.mockRestore();
  });
});
