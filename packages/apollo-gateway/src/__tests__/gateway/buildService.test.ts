import gql from 'graphql-tag';
import { fetch } from '__mocks__/apollo-server-env';
import { createTestClient } from 'apollo-server-testing';
import { ApolloServerBase as ApolloServer } from 'apollo-server-core';

import { RemoteGraphQLDataSource } from '../../datasources/RemoteGraphQLDataSource';
import { ApolloGateway, SERVICE_DEFINITION_QUERY } from '../../';
import { fixtures } from 'apollo-federation-integration-testsuite';

beforeEach(() => {
  fetch.mockReset();
});

it('calls buildService only once per service', async () => {
  fetch.mockJSONResponseOnce({
    data: { _service: { sdl: `extend type Query { thing: String }` } },
  });

  const buildServiceSpy = jest.fn(() => {
    return new RemoteGraphQLDataSource({
      url: 'https://api.example.com/foo',
    });
  });

  const gateway = new ApolloGateway({
    serviceList: [{ name: 'foo', url: 'https://api.example.com/foo' }],
    buildService: buildServiceSpy
  });

  await gateway.load();

  expect(buildServiceSpy).toHaveBeenCalledTimes(1);
});

it('correctly passes the context from ApolloServer to datasources', async () => {
  const gateway = new ApolloGateway({
    localServiceList: fixtures,
    buildService: _service => {
      return new RemoteGraphQLDataSource({
        url: 'https://api.example.com/foo',
        willSendRequest: ({ request, context }) => {
          request.http?.headers.set('x-user-id', context.userId);
        },
      });
    },
  });

  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({
    schema,
    executor,
    context: () => ({
      userId: '1234',
    }),
  });

  const call = createTestClient(server);

  const query = gql`
    {
      me {
        username
      }
    }
  `;

  fetch.mockJSONResponseOnce({ data: { me: { username: '@jbaxleyiii' } } });

  const result = await call.query({
    query,
  });

  expect(result.errors).toBeUndefined();
  expect(result.data).toEqual({
    me: { username: '@jbaxleyiii' },
  });

  expect(fetch).toBeCalledTimes(1);
  expect(fetch).toHaveFetched({
    url: 'https://api.example.com/foo',
    body: {
      query: `{me{username}}`,
      variables: {},
    },
    headers: {
      'x-user-id': '1234',
    },
  });
});

function createSdlData(sdl: string): object {
  return {
    data: {
      _service: {
        sdl: sdl,
      },
    },
  };
}

it('makes enhanced introspection request using datasource', async () => {
  fetch.mockJSONResponseOnce(
    createSdlData('extend type Query { one: String }'),
  );

  const gateway = new ApolloGateway({
    serviceList: [
      {
        name: 'one',
        url: 'https://api.example.com/one',
      },
    ],
    buildService: _service => {
      return new RemoteGraphQLDataSource({
        url: 'https://api.example.com/override',
        willSendRequest: ({ request }) => {
          request.http?.headers.set('custom-header', 'some-custom-value');
        },
      });
    },
  });

  await gateway.load();

  expect(fetch).toBeCalledTimes(1);

  expect(fetch).toHaveFetched({
    url: 'https://api.example.com/override',
    body: {
      query: SERVICE_DEFINITION_QUERY,
    },
    headers: {
      'custom-header': 'some-custom-value',
    },
  });
});

it('customizes request on a per-service basis', async () => {
  fetch
    .mockJSONResponseOnce(createSdlData('extend type Query { one: String }'))
    .mockJSONResponseOnce(createSdlData('extend type Query { two: String }'))
    .mockJSONResponseOnce(createSdlData('extend type Query { three: String }'));

  const gateway = new ApolloGateway({
    serviceList: [
      {
        name: 'one',
        url: 'https://api.example.com/one',
      },
      {
        name: 'two',
        url: 'https://api.example.com/two',
      },
      {
        name: 'three',
        url: 'https://api.example.com/three',
      },
    ],
    buildService: service => {
      return new RemoteGraphQLDataSource({
        url: service.url,
        willSendRequest: ({ request }) => {
          request.http?.headers.set('service-name', service.name);
        },
      });
    },
  });

  await gateway.load();

  expect(fetch).toBeCalledTimes(3);

  expect(fetch).toHaveFetched({
    url: 'https://api.example.com/one',
    body: {
      query: `query __ApolloGetServiceDefinition__ { _service { sdl } }`,
    },
    headers: {
      'service-name': 'one',
    },
  });

  expect(fetch).toHaveFetched({
    url: 'https://api.example.com/two',
    body: {
      query: `query __ApolloGetServiceDefinition__ { _service { sdl } }`,
    },
    headers: {
      'service-name': 'two',
    },
  });

  expect(fetch).toHaveFetched({
    url: 'https://api.example.com/three',
    body: {
      query: `query __ApolloGetServiceDefinition__ { _service { sdl } }`,
    },
    headers: {
      'service-name': 'three',
    },
  });
});

it('does not share service definition cache between gateways', async () => {
  let updates = 0;
  const updateObserver: any = (..._args: any[]) => {
    updates += 1;
  };

  // Initialize first gateway
  {
    fetch.mockJSONResponseOnce(
      createSdlData('extend type Query { repeat: String }'),
    );

    const gateway = new ApolloGateway({
      serviceList: [
        {
          name: 'repeat',
          url: 'https://api.example.com/repeat',
        },
      ],
      experimental_didUpdateComposition: updateObserver,
    });

    await gateway.load();
  }

  // Initialize second gateway
  {
    fetch.mockJSONResponseOnce(
      createSdlData('extend type Query { repeat: String }'),
    );

    const gateway = new ApolloGateway({
      serviceList: [
        {
          name: 'repeat',
          url: 'https://api.example.com/repeat',
        },
      ],
      experimental_didUpdateComposition: updateObserver,
    });

    await gateway.load();
  }

  expect(updates).toEqual(2);
});
