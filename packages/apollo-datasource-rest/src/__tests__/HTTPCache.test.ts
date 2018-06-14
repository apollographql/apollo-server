import 'apollo-server-env';
import { HTTPCache } from '../HTTPCache';

import fetch, { mockFetch, unmockFetch } from '../__mocks__/fetch';
import { mockDate, unmockDate, advanceTimeBy } from '../__mocks__/date';

describe('HTTPCache', () => {
  let store: Map<string, string>;
  let httpCache: HTTPCache;

  beforeAll(() => {
    mockFetch();
    mockDate();
  });

  beforeEach(() => {
    fetch.mockReset();

    store = new Map();
    httpCache = new HTTPCache({
      async get(key: string) {
        return store.get(key);
      },
      async set(key: string, value: string) {
        store.set(key, value);
      },
    });
  });

  afterAll(() => {
    unmockFetch();
    unmockDate();
  });

  it('fetches a response from the origin when not cached', async () => {
    fetch.mockJSONResponseOnce({ name: 'Ada Lovelace' });

    const response = await httpCache.fetch('https://api.example.com/people/1');

    expect(fetch.mock.calls.length).toEqual(1);
    expect(await response.json()).toEqual({ name: 'Ada Lovelace' });
  });

  it('returns a cached response when not expired', async () => {
    fetch.mockJSONResponseOnce(
      { name: 'Ada Lovelace' },
      { 'Cache-Control': 'max-age=30' },
    );

    await httpCache.fetch('https://api.example.com/people/1');

    advanceTimeBy(10000);

    const response = await httpCache.fetch('https://api.example.com/people/1');

    expect(fetch.mock.calls.length).toEqual(1);
    expect(await response.json()).toEqual({ name: 'Ada Lovelace' });
    expect(response.headers.get('Age')).toEqual('10');
  });

  it('fetches a fresh response from the origin when expired', async () => {
    fetch.mockJSONResponseOnce(
      { name: 'Ada Lovelace' },
      { 'Cache-Control': 'max-age=30' },
    );

    await httpCache.fetch('https://api.example.com/people/1');

    advanceTimeBy(30000);

    fetch.mockJSONResponseOnce(
      { name: 'Alan Turing' },
      { 'Cache-Control': 'max-age=30' },
    );

    const response = await httpCache.fetch('https://api.example.com/people/1');

    expect(fetch.mock.calls.length).toEqual(2);

    expect(await response.json()).toEqual({ name: 'Alan Turing' });
    expect(response.headers.get('Age')).toEqual('0');
  });

  it('does not store a response with a non-success status code', async () => {
    fetch.mockResponseOnce(
      'Internal server error',
      { 'Cache-Control': 'max-age=30' },
      500,
    );

    await httpCache.fetch('https://api.example.com/people/1');

    expect(store.size).toEqual(0);
  });

  it('does not store a response without Cache-Control header', async () => {
    fetch.mockJSONResponseOnce({ name: 'Ada Lovelace' });

    await httpCache.fetch('https://api.example.com/people/1');

    expect(store.size).toEqual(0);
  });

  it('does not store a private response', async () => {
    fetch.mockJSONResponseOnce(
      { name: 'Ada Lovelace' },
      { 'Cache-Control': 'private, max-age: 60' },
    );

    await httpCache.fetch('https://api.example.com/me');

    expect(store.size).toEqual(0);
  });

  it('returns a cached response when Vary header fields match', async () => {
    fetch.mockJSONResponseOnce(
      { name: 'Ada Lovelace' },
      { 'Cache-Control': 'max-age=30', Vary: 'Accept-Language' },
    );

    await httpCache.fetch('https://api.example.com/people/1', {
      headers: { 'Accept-Language': 'en' },
    });

    const response = await httpCache.fetch('https://api.example.com/people/1', {
      headers: { 'Accept-Language': 'en' },
    });

    expect(fetch.mock.calls.length).toEqual(1);
    expect(await response.json()).toEqual({ name: 'Ada Lovelace' });
  });

  it(`does not return a cached response when Vary header fields don't match`, async () => {
    fetch.mockJSONResponseOnce(
      { name: 'Ada Lovelace' },
      { 'Cache-Control': 'max-age=30', Vary: 'Accept-Language' },
    );

    await httpCache.fetch('https://api.example.com/people/1', {
      headers: { 'Accept-Language': 'en' },
    });

    fetch.mockJSONResponseOnce(
      { name: 'Alan Turing' },
      { 'Cache-Control': 'max-age=30' },
    );

    const response = await httpCache.fetch('https://api.example.com/people/1', {
      headers: { 'Accept-Language': 'fr' },
    });

    expect(fetch.mock.calls.length).toEqual(2);
    expect(await response.json()).toEqual({ name: 'Alan Turing' });
  });

  it('revalidates a cached response when expired and returns the cached response when not modified', async () => {
    fetch.mockJSONResponseOnce(
      { name: 'Ada Lovelace' },
      {
        'Cache-Control': 'public, max-age=30',
        ETag: 'foo',
      },
    );

    await httpCache.fetch('https://api.example.com/people/1');

    advanceTimeBy(30000);

    fetch.mockResponseOnce(
      null,
      {
        'Cache-Control': 'public, max-age=30',
        ETag: 'foo',
      },
      304,
    );

    const response = await httpCache.fetch('https://api.example.com/people/1');

    expect(fetch.mock.calls.length).toEqual(2);
    expect(fetch.mock.calls[1][0].headers.get('If-None-Match')).toEqual('foo');

    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({ name: 'Ada Lovelace' });
    expect(response.headers.get('Age')).toEqual('0');

    advanceTimeBy(10000);

    const response2 = await httpCache.fetch('https://api.example.com/people/1');

    expect(fetch.mock.calls.length).toEqual(2);

    expect(response2.status).toEqual(200);
    expect(await response2.json()).toEqual({ name: 'Ada Lovelace' });
    expect(response2.headers.get('Age')).toEqual('10');
  });

  it('revalidates a cached response when expired and returns and caches a fresh response when modified', async () => {
    fetch.mockJSONResponseOnce(
      { name: 'Ada Lovelace' },
      {
        'Cache-Control': 'public, max-age=30',
        ETag: 'foo',
      },
    );

    await httpCache.fetch('https://api.example.com/people/1');

    advanceTimeBy(30000);

    fetch.mockJSONResponseOnce(
      { name: 'Alan Turing' },
      {
        'Cache-Control': 'public, max-age=30',
        ETag: 'bar',
      },
    );

    const response = await httpCache.fetch('https://api.example.com/people/1');

    expect(fetch.mock.calls.length).toEqual(2);
    expect(fetch.mock.calls[1][0].headers.get('If-None-Match')).toEqual('foo');

    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({ name: 'Alan Turing' });

    advanceTimeBy(10000);

    const response2 = await httpCache.fetch('https://api.example.com/people/1');

    expect(fetch.mock.calls.length).toEqual(2);

    expect(response2.status).toEqual(200);
    expect(await response2.json()).toEqual({ name: 'Alan Turing' });
    expect(response2.headers.get('Age')).toEqual('10');
  });
});
