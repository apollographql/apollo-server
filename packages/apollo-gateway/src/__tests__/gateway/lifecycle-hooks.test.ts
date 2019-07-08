import { ApolloServer } from 'apollo-server';

import { getServiceDefinitionsFromRemoteEndpoint } from '../../loadServicesFromRemoteEndpoint';
import { ApolloGateway, GatewayConfig } from '../../index';
import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';
import { buildFederatedSchema, ServiceDefinition } from '@apollo/federation';
import gql from 'graphql-tag';

const services = [product, reviews, inventory, accounts, books];

const booksReplacement = {
  name: 'books',
  typeDefs: gql`
    extend type Query {
      book(isbn: String): Book
    }
    type Book {
      isbn: String!
    }
  `,
  resolvers: {
    Query: {
      book: () => ({ isbn: 0 }),
    },
  },
};

// jest.useFakeTimers();

describe('lifecycle hooks', () => {
  let serviceDefinitions: (ServiceDefinition & { port: number | string })[];
  let apolloServers: { port: number | string; server: ApolloServer }[] = [];

  // takes a service and a port and starts an apolloServer
  // if no port is passed, it'll start it at a random one (0)
  const startServerFromDefinition = (
    service: ServiceDefinition,
    portToStartFrom?: number | string,
  ) => {
    const server = new ApolloServer({
      schema: buildFederatedSchema([service]),
      introspection: true,
    });

    return server.listen({ port: portToStartFrom || 0 }).then(({ port }) => {
      apolloServers.push({ server, port });
      return { ...service, port };
    });
  };

  beforeEach(async () => {
    serviceDefinitions = await Promise.all(
      services.map(service => startServerFromDefinition(service)),
    );
  });

  afterEach(() => {
    apolloServers.forEach(server => server.server.stop());
    apolloServers = [];
  });

  it('uses updateServiceDefinitions override', async () => {
    const experimental_updateServiceDefinitions = jest.fn(
      async (config: GatewayConfig) => {
        if (!config.serviceList) return [];
        const [definitions] = await getServiceDefinitionsFromRemoteEndpoint({
          serviceList: config.serviceList,
        });
        return definitions;
      },
    );

    const gateway = new ApolloGateway({
      serviceList: serviceDefinitions.map(service => ({
        name: service.name,
        url: `http://localhost:${service.port}`,
      })),
      experimental_updateServiceDefinitions,
      experimental_didUpdateComputedFederationConfig: jest.fn(),
    });

    const interval = await gateway.loadAndPoll();

    expect(experimental_updateServiceDefinitions).toBeCalled();
    clearInterval(interval);
  });

  it('calls experimental_didFailComposition with a bad config', async () => {
    // const experimental_updateServiceDefinitions = () => [];
    const update = jest.fn(async (config: GatewayConfig) => {
      if (!config.serviceList) return [];
      const [definitions] = await getServiceDefinitionsFromRemoteEndpoint({
        serviceList: config.serviceList,
      });
      return [definitions[0]];
    });

    const experimental_didFailComposition = jest.fn();

    const gateway = new ApolloGateway({
      serviceList: serviceDefinitions.map(service => ({
        name: service.name,
        url: `http://localhost:${service.port}`,
      })),
      experimental_updateServiceDefinitions: update,
      experimental_didFailComposition,
    });

    const interval = await gateway.loadAndPoll();

    const callbackArgs = experimental_didFailComposition.mock.calls[0][0];

    expect(callbackArgs.serviceList).toHaveLength(1);
    expect(callbackArgs.errors).toMatchInlineSnapshot(`
      Array [
        [GraphQLError: [product] Book -> \`Book\` is an extension type, but \`Book\` is not defined in any service],
      ]
    `);
    clearInterval(interval);
  });

  it('calls experimental_didUpdateComputedFederationConfig on schema update', async done => {
    const update = jest.fn(async (config: GatewayConfig) => {
      if (!config.serviceList) return [];
      const [definitions] = await getServiceDefinitionsFromRemoteEndpoint({
        serviceList: config.serviceList,
      });
      return definitions;
    });

    const experimental_didUpdateComputedFederationConfig = jest.fn();

    const gateway = new ApolloGateway({
      serviceList: serviceDefinitions.map(service => ({
        name: service.name,
        url: `http://localhost:${service.port}`,
      })),
      experimental_updateServiceDefinitions: update,
      experimental_pollInterval: 100,
      experimental_didUpdateComputedFederationConfig,
    });

    const interval = await gateway.loadAndPoll();

    await new Promise(resolve => setTimeout(resolve, 200));

    // find the service definition that is for the "books" service.
    const booksDefinition = serviceDefinitions.find(s => s.name === 'books')!;
    // keep the port of that service so we can start a replacement book service
    const booksPort = booksDefinition.port;
    // find the apollo server instance using this port
    const existingBooksServer = apolloServers.find(s => s.port === booksPort)!;
    // stop the existing server
    existingBooksServer.server.stop();

    // start a replacement books service
    await startServerFromDefinition(booksReplacement, booksPort);

    // wait for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 300));

    // after now, the service should have polled and updated the config based
    // off the new book service schema

    const {
      calls: [firstCall, secondCall],
    } = experimental_didUpdateComputedFederationConfig.mock;

    expect(firstCall[0]).toHaveProperty('currentConfig');
    expect(firstCall[0]).not.toHaveProperty('previousConfig');

    expect(secondCall[0]).toHaveProperty('currentConfig');
    expect(secondCall[0]).toHaveProperty('previousConfig');

    clearInterval(interval);

    done();
  });

  it('using default service definition updater', async done => {
    const experimental_didUpdateComputedFederationConfig = jest.fn();

    const gateway = new ApolloGateway({
      serviceList: serviceDefinitions.map(service => ({
        name: service.name,
        url: `http://localhost:${service.port}`,
      })),
      experimental_pollInterval: 100,
      experimental_didUpdateComputedFederationConfig,
    });

    const spy = jest.spyOn(gateway, 'updateServiceDefinitions');

    const interval = await gateway.loadAndPoll();

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(spy.mock.calls.length).toEqual(2);
    expect(
      experimental_didUpdateComputedFederationConfig.mock.calls.length,
    ).toEqual(2);

    clearInterval(interval);
    done();
  });
});
