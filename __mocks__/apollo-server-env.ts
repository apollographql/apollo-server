/// <reference types="jest" />

import {
  fetch,
  Request,
  RequestInit,
  Response,
  Body,
  BodyInit,
  Headers,
  HeadersInit,
  URL,
  URLSearchParams,
  URLSearchParamsInit,
} from '../packages/apollo-server-env';

interface FetchMock extends jest.Mock<typeof fetch> {
  mockResponseOnce(data?: any, headers?: HeadersInit, status?: number): this;
  mockJSONResponseOnce(data?: object, headers?: HeadersInit): this;
}

const mockFetch = jest.fn<typeof fetch>(fetch) as FetchMock;

mockFetch.mockResponseOnce = (
  data?: BodyInit,
  headers?: Headers,
  status: number = 200,
) => {
  return mockFetch.mockImplementationOnce(async () => {
    return new Response(data, {
      status,
      headers,
    });
  });
};

mockFetch.mockJSONResponseOnce = (
  data = {},
  headers?: Headers,
  status?: number,
) => {
  return mockFetch.mockResponseOnce(
    JSON.stringify(data),
    Object.assign({ 'Content-Type': 'application/json' }, headers),
    status,
  );
};

const env = {
  fetch: mockFetch,
  Request,
  Response,
  Body,
  Headers,
  URL,
  URLSearchParams,
};

jest.doMock('apollo-server-env', () => env);

export = env;
