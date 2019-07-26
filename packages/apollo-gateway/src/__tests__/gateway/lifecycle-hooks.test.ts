import { ApolloGateway, GatewayConfig } from '../../index';
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
    const experimental_updateServiceDefinitions = jest.fn(
      async (config: GatewayConfig) => {
        return serviceDefinitions;
      },
    );

    const gateway = new ApolloGateway({
      serviceList: serviceDefinitions,
      experimental_updateServiceDefinitions,
      experimental_didUpdateComputedFederationConfig: jest.fn(),
    });

    const { interval } = await gateway.load();

    expect(experimental_updateServiceDefinitions).toBeCalled();
    clearInterval(interval);
  });

  it('calls experimental_didFailComposition with a bad config', async () => {
    // const experimental_updateServiceDefinitions = () => [];
    const update = jest.fn(async (config: GatewayConfig) => {
      return [serviceDefinitions[0]];
    });

    const experimental_didFailComposition = jest.fn();

    const gateway = new ApolloGateway({
      serviceList: serviceDefinitions,
      experimental_updateServiceDefinitions: update,
      experimental_didFailComposition,
    });

    const { interval } = await gateway.load();

    const callbackArgs = experimental_didFailComposition.mock.calls[0][0];

    expect(callbackArgs.serviceList).toHaveLength(1);
    expect(callbackArgs.errors).toMatchInlineSnapshot(`
                        Array [
                          [GraphQLError: [product] Book -> \`Book\` is an extension type, but \`Book\` is not defined in any service],
                        ]
                `);
    clearInterval(interval);
  });

  it('calls experimental_didUpdateComposition on schema update', async done => {
    const update = jest.fn();
    update.mockImplementationOnce(async (config: GatewayConfig) => {
      return serviceDefinitions;
    });
    update.mockImplementationOnce(async (config: GatewayConfig) => {
      // remove first item and use rest
      const services = serviceDefinitions.filter(s => s.name !== 'books');
      // overwrite books service with a similar 'book' service
      return [
        ...services,
        {
          name: 'book',
          typeDefs: books.typeDefs,
          url: 'http://localhost:32542',
        },
      ];
    });

    const experimental_didUpdateComposition = jest.fn();

    const gateway = new ApolloGateway({
      serviceList: serviceDefinitions,
      experimental_updateServiceDefinitions: update,
      experimental_pollInterval: 10,
      experimental_didUpdateComposition,
    });

    const { interval } = await gateway.load();

    await new Promise(resolve => setTimeout(resolve, 20));

    const {
      calls: [firstCall, secondCall],
    } = experimental_didUpdateComposition.mock;

    expect(experimental_didUpdateComposition).toHaveBeenCalledTimes(2);

    // first call's `current` arg should have a schema
    expect(firstCall[0].schema).toBeDefined();
    expect(firstCall[1]).toBeUndefined();

    expect(secondCall[0].schema).toBeDefined();
    // second call should have a previous schema
    expect(secondCall[1].schema).toBeDefined();

    clearInterval(interval);

    done();
  });

  it('uses default service definition updater', async () => {
    const gateway = new ApolloGateway({
      localServiceList: serviceDefinitions,
    });

    const spy = jest.spyOn(gateway, 'updateServiceDefinitions');

    const { interval } = await gateway.load();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('warns when polling on the default fetcher', async () => {
    const consoleSpy = jest.spyOn(console, 'warn');
    const gateway = new ApolloGateway({
      serviceList: serviceDefinitions,
      experimental_pollInterval: 10,
    });
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "Polling running services is dangerous and not recommended in production. Polling should only be used against a registry. Use with caution.",
      ]
    `);
  });

  it('warns when polling using a custom serviceList fetcher', async () => {
    const consoleSpy = jest.spyOn(console, 'warn');
    const gateway = new ApolloGateway({
      experimental_updateServiceDefinitions: jest.fn(),
      experimental_pollInterval: 10,
    });
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "Polling running services is dangerous and not recommended in production. Polling should only be used against a registry. Use with caution.",
      ]
    `);
  });
});
