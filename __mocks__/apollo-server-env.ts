import {
  fetch,
  Request,
  Response,
  BodyInit,
  Headers,
  URL,
  URLSearchParams,
} from 'apollo-server-env';

type Headers = { [name: string]: string };

interface FetchMock extends jest.Mock<typeof fetch> {
  mockResponseOnce(data?: any, headers?: Headers, status?: number);
  mockJSONResponseOnce(data?: object, headers?: Headers);
}

const mockFetch = jest.fn<typeof fetch>() as FetchMock;

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

export = {
  fetch: mockFetch,
  Request,
  Response,
  Headers,
  URL,
  URLSearchParams,
};
