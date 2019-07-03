import { ApolloServer } from 'apollo-server';

import { getServiceDefinitionsFromRemoteEndpoint } from '../../loadServicesFromRemoteEndpoint';
import { ApolloGateway, GatewayConfig } from '../../index';
import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';
import { buildFederatedSchema } from '@apollo/federation';
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

describe('lifecycle hooks', () => {
  let serviceDefinitions;
  let apolloServers: { port: number; server: ApolloServer }[] = [];

  // takes a service and a port and starts an apolloServer
  // if no port is passed, it'll start it at a random one (0)
  const startServerFromDefinition = (service, portToStartFrom) => {
    const server = new ApolloServer({
      schema: buildFederatedSchema([service]),
      introspection: true,
    });
    // apolloServers.push(server);
    return server.listen({ port: portToStartFrom || 0 }).then(({ port }) => {
      apolloServers.push({ server, port });
      return { ...service, port };
    });
  };

  beforeEach(async () => {
    serviceDefinitions = await Promise.all(
      services.map(startServerFromDefinition),
    );
  });
  afterEach(() => {
    apolloServers.forEach(server => server.server.stop());
    apolloServers = [];
  });

  it('uses updateServiceDefinitions override', async () => {
    const update = jest.fn(async (config: GatewayConfig) => {
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
      // experimental_didUpdateComputedFederationConfig,
    });

    const interval = await gateway.loadAndPoll();

    expect(update).toBeCalled();
    clearInterval(interval);
  });

  it('calls experimental_didFailComposition with a bad config', async () => {
    // const experimental_updateServiceDefinitions = () => [];
    const update = jest.fn(async (config: GatewayConfig) => {
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

  fit('calls experimental_didUpdateComputedFederationConfig on schema update', async done => {
    const update = jest.fn(async (config: GatewayConfig) => {
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
      experimental_pollInterval: 1000,
      experimental_didUpdateComputedFederationConfig,
    });

    const interval = await gateway.loadAndPoll();
    new Promise(resolve => setTimeout(resolve, 2000));

    // find the service definition that is for the "books" service.
    const booksDefinition = serviceDefinitions.find(s => s.name === 'books');
    // keep the port of that service so we can start a replacement book service
    const booksPort = booksDefinition.port;
    // find the apollo server instance using this port
    const existingBooksServer = apolloServers.find(s => s.port === booksPort);
    // stop the existing server
    existingBooksServer.server.stop();

    // start a replacement books service
    const newBooksService = await startServerFromDefinition(
      booksReplacement,
      booksPort,
    );

    // wait for 3 seconds
    new Promise(resolve => setTimeout(resolve, 3000));

    // after now, the service should have polled and updated the config based
    // off the new book service schema
    // expect(experimental_didUpdateComputedFederationConfig).toHaveBeenCalledWith(
    //   {},
    // );
    clearInterval(interval);
  });
});

it.todo('changing schema after poll');
it.todo('without overriding fetcher');

it.todo('');
