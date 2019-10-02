import { fetch } from '__mocks__/apollo-server-env';

import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-errors';

import { RemoteGraphQLDataSource } from '../RemoteGraphQLDataSource';

beforeEach(() => {
  fetch.mockReset();
});

describe('constructing requests', () => {
  it('stringifies a request with a query', async () => {
    const DataSource = new RemoteGraphQLDataSource({
      url: 'https://api.example.com/foo',
    });

    fetch.mockJSONResponseOnce({ data: { me: 'james' } });

    const { data } = await DataSource.process({
      request: { query: '{ me { name } }' },
    });

    expect(data).toEqual({ me: 'james' });
    expect(fetch).toBeCalledTimes(1);
    expect(fetch).toHaveFetched({
      url: 'https://api.example.com/foo',
      body: { query: '{ me { name } }' },
    });
  });

  it('passes variables', async () => {
    const DataSource = new RemoteGraphQLDataSource({
      url: 'https://api.example.com/foo',
    });

    fetch.mockJSONResponseOnce({ data: { me: 'james' } });

    const { data } = await DataSource.process({
      request: {
        query: '{ me { name } }',
        variables: { id: '1' },
      },
    });

    expect(data).toEqual({ me: 'james' });
    expect(fetch).toBeCalledTimes(1);
    expect(fetch).toHaveFetched({
      url: 'https://api.example.com/foo',
      body: { query: '{ me { name } }', variables: { id: '1' } },
    });
  });
});

describe('willSendRequest', () => {
  it('allows for modifying variables', async () => {
    const DataSource = new RemoteGraphQLDataSource({
      url: 'https://api.example.com/foo',
      willSendRequest: ({ request }) => {
        request.variables = JSON.stringify(request.variables);
      },
    });

    fetch.mockJSONResponseOnce({ data: { me: 'james' } });

    const { data } = await DataSource.process({
      request: {
        query: '{ me { name } }',
        variables: { id: '1' },
      },
    });

    expect(data).toEqual({ me: 'james' });
    expect(fetch).toHaveFetched({
      url: 'https://api.example.com/foo',
      body: {
        query: '{ me { name } }',
        variables: JSON.stringify({ id: '1' }),
      },
    });
  });

  it('accepts context', async () => {
    const DataSource = new RemoteGraphQLDataSource({
      url: 'https://api.example.com/foo',
      willSendRequest: ({ request, context }) => {
        request.http.headers.set('x-user-id', context.userId);
      },
    });

    fetch.mockJSONResponseOnce({ data: { me: 'james' } });

    const { data } = await DataSource.process({
      request: {
        query: '{ me { name } }',
        variables: { id: '1' },
      },
      context: { userId: '1234' },
    });

    expect(data).toEqual({ me: 'james' });
    expect(fetch).toHaveFetched({
      url: 'https://api.example.com/foo',
      body: {
        query: '{ me { name } }',
        variables: { id: '1' },
      },
      headers: {
        'x-user-id': '1234',
      },
    });
  });
});

describe('error handling', () => {
  it('throws an AuthenticationError when the response status is 401', async () => {
    const DataSource = new RemoteGraphQLDataSource({
      url: 'https://api.example.com/foo',
    });

    fetch.mockResponseOnce('Invalid token', undefined, 401);

    const result = DataSource.process({
      request: { query: '{ me { name } }' },
    });
    await expect(result).rejects.toThrow(AuthenticationError);
    await expect(result).rejects.toMatchObject({
      extensions: {
        code: 'UNAUTHENTICATED',
        response: {
          status: 401,
          body: 'Invalid token',
        },
      },
    });
  });

  it('throws a ForbiddenError when the response status is 403', async () => {
    const DataSource = new RemoteGraphQLDataSource({
      url: 'https://api.example.com/foo',
    });

    fetch.mockResponseOnce('No access', undefined, 403);

    const result = DataSource.process({
      request: { query: '{ me { name } }' },
    });
    await expect(result).rejects.toThrow(ForbiddenError);
    await expect(result).rejects.toMatchObject({
      extensions: {
        code: 'FORBIDDEN',
        response: {
          status: 403,
          body: 'No access',
        },
      },
    });
  });

  it('throws an ApolloError when the response status is 500', async () => {
    const DataSource = new RemoteGraphQLDataSource({
      url: 'https://api.example.com/foo',
    });

    fetch.mockResponseOnce('Oops', undefined, 500);

    const result = DataSource.process({
      request: { query: '{ me { name } }' },
    });
    await expect(result).rejects.toThrow(ApolloError);
    await expect(result).rejects.toMatchObject({
      extensions: {
        response: {
          status: 500,
          body: 'Oops',
        },
      },
    });
  });

  it('puts JSON error responses on the error as an object', async () => {
    const DataSource = new RemoteGraphQLDataSource({
      url: 'https://api.example.com/foo',
    });

    fetch.mockResponseOnce(
      JSON.stringify({
        errors: [
          {
            message: 'Houston, we have a problem.',
          },
        ],
      }),
      { 'Content-Type': 'application/json' },
      500,
    );

    const result = DataSource.process({
      request: { query: '{ me { name } }' },
    });
    await expect(result).rejects.toThrow(ApolloError);
    await expect(result).rejects.toMatchObject({
      extensions: {
        response: {
          status: 500,
          body: {
            errors: [
              {
                message: 'Houston, we have a problem.',
              },
            ],
          },
        },
      },
    });
  });
});
