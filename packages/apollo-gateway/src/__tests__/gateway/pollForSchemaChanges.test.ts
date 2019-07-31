jest.mock('node-fetch');
import fetch, {Response} from 'node-fetch';
import { ApolloServerBase as ApolloServer } from 'apollo-server-core';

import { ApolloGateway } from '../../';

beforeEach(() => {
  jest.mock('node-fetch', ()=>jest.fn())
});

it('checks for changes to a federated schema on a default polling schedule', async () => {
  jest.useFakeTimers()

  const gateway = new ApolloGateway({
    serviceList: [{ name: 'foo', url: 'https://api.example.com/foo'}],
    pollForSchemaChanges: true,
  });

  expect(setInterval).toHaveBeenCalledTimes(1);
  expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 10 * 1000);

  const sdl = `
    type Query {
      foo: String
    }
  `
  fetch.mockReturnValue(Promise.resolve({ json: () => ({ data: { _service: { sdl } } }) }));

  await gateway.load();

  expect(fetch).toBeCalledTimes(1);

  jest.advanceTimersByTime(31 * 1000);

  expect(fetch).toBeCalledTimes(4);
  expect(fetch).toHaveBeenCalledWith('https://api.example.com/foo', {
    method: 'POST',
    body: '{"query":"query GetServiceDefinition { _service { sdl } }"}',
    headers: {
      'Content-Type': 'application/json',
    },
  });
});

it('allows for a custom polling schedule', async () => {
  jest.useFakeTimers()

  const gateway = new ApolloGateway({
    serviceList: [{ name: 'foo', url: 'https://api.example.com/foo'}],
    pollForSchemaChanges: true,
    schemaChangePollingPeriod: 600 * 1000
  });

  expect(setInterval).toHaveBeenCalledTimes(1);
  expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 600 * 1000);
});

