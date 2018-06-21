declare global {
  namespace NodeJS {
    interface Global {
      fetch: typeof fetch;
    }
  }
}

type Headers = { [name: string]: string };

interface FetchMock extends jest.Mock<typeof fetch> {
  mockResponseOnce(data?: any, headers?: Headers, status?: number);
  mockJSONResponseOnce(data?: object, headers?: Headers);
}

const fetchMock = jest.fn<typeof fetch>() as FetchMock;

fetchMock.mockResponseOnce = (
  data?: BodyInit,
  headers?: Headers,
  status: number = 200,
) => {
  return fetchMock.mockImplementationOnce(async () => {
    return new Response(data, {
      status,
      headers,
    });
  });
};

fetchMock.mockJSONResponseOnce = (
  data = {},
  headers?: Headers,
  status?: number,
) => {
  return fetchMock.mockResponseOnce(
    JSON.stringify(data),
    Object.assign({ 'Content-Type': 'application/json' }, headers),
    status,
  );
};

export default fetchMock;

export function mockFetch() {
  global.fetch = fetchMock;
}

export function unmockFetch() {
  global.fetch = fetch;
}
