import { fetch } from '../../../../__mocks__/apollo-server-env';

import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-errors';
import { RESTDataSource, Request } from '../RESTDataSource';

import { HTTPCache } from '../HTTPCache';

describe('RESTDataSource', () => {
  const store = new Map<string, string>();
  let httpCache: HTTPCache;

  beforeAll(() => {
    httpCache = new HTTPCache({
      async get(key: string) {
        return store.get(key);
      },
      async set(key: string, value: string) {
        store.set(key, value);
      },
    });
  });

  beforeEach(() => {
    fetch.mockReset();
    store.clear();
  });

  it('returns data as parsed JSON when Content-Type is application/json', async () => {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      getFoo() {
        return this.get('foo');
      }
    }();

    dataSource.httpCache = httpCache;

    fetch.mockJSONResponseOnce(
      { foo: 'bar' },
      { 'Content-Type': 'application/json' },
    );

    const data = await dataSource.getFoo();

    expect(data).toEqual({ foo: 'bar' });
  });

  it('returns data as a string when Content-Type is text/plain', async () => {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      getFoo() {
        return this.get('foo');
      }
    }();

    dataSource.httpCache = httpCache;

    fetch.mockResponseOnce('bar', { 'Content-Type': 'text/plain' });

    const data = await dataSource.getFoo();

    expect(data).toEqual('bar');
  });

  it('attempts to return data as a string when no Content-Type header is returned', async () => {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      getFoo() {
        return this.get('foo');
      }
    }();

    dataSource.httpCache = httpCache;

    fetch.mockResponseOnce('bar');

    const data = await dataSource.getFoo();

    expect(data).toEqual('bar');
  });

  it('interprets paths relative to the baseURL', async () => {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      getFoo() {
        return this.get('foo');
      }
    }();

    dataSource.httpCache = httpCache;

    fetch.mockJSONResponseOnce();

    await dataSource.getFoo();

    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0].url).toEqual('https://api.example.com/foo');
  });

  it('adds a trailing slash to the baseURL if needed', async () => {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://example.com/api';

      getFoo() {
        return this.get('foo');
      }
    }();

    dataSource.httpCache = httpCache;

    fetch.mockJSONResponseOnce();

    await dataSource.getFoo();

    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0].url).toEqual('https://example.com/api/foo');
  });

  it('allows adding query string parameters', async () => {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      getPostsForUser(
        username: string,
        params: { filter: string; limit: number; offset: number },
      ) {
        return this.get('posts', Object.assign({ username }, params));
      }
    }();

    dataSource.httpCache = httpCache;

    fetch.mockJSONResponseOnce();

    await dataSource.getPostsForUser('beyoncé', {
      filter: 'jalapeño',
      limit: 10,
      offset: 20,
    });

    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0].url).toEqual(
      'https://api.example.com/posts?username=beyonc%C3%A9&filter=jalape%C3%B1o&limit=10&offset=20',
    );
  });

  it('allows setting request headers', async () => {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      willSendRequest(request: Request) {
        request.headers.set('Authorization', 'secret');
      }

      getFoo() {
        return this.get('foo');
      }
    }();

    dataSource.httpCache = httpCache;

    fetch.mockJSONResponseOnce();

    await dataSource.getFoo();

    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0].headers.get('Authorization')).toEqual(
      'secret',
    );
  });

  it('allows passing a request body', async () => {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      postFoo(foo) {
        return this.post('foo', foo);
      }
    }();

    dataSource.httpCache = httpCache;

    fetch.mockJSONResponseOnce();

    await dataSource.postFoo({ foo: 'bar' });

    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0].url).toEqual('https://api.example.com/foo');
    expect(fetch.mock.calls[0][0].body).toEqual(JSON.stringify({ foo: 'bar' }));
    expect(fetch.mock.calls[0][0].headers.get('Content-Type')).toEqual(
      'application/json',
    );
  });

  for (const method of ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']) {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      getFoo() {
        return this.get('foo');
      }

      postFoo() {
        return this.post('foo');
      }

      patchFoo() {
        return this.patch('foo');
      }

      putFoo() {
        return this.put('foo');
      }

      deleteFoo() {
        return this.delete('foo');
      }
    }();

    it(`allows performing ${method} requests`, async () => {
      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce({ foo: 'bar' });

      const data = await dataSource[`${method.toLocaleLowerCase()}Foo`]();

      expect(data).toEqual({ foo: 'bar' });

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0].method).toEqual(method);
    });
  }

  it('throws an AuthenticationError when the response status is 401', async () => {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      getFoo() {
        return this.get('foo');
      }
    }();

    dataSource.httpCache = httpCache;

    fetch.mockResponseOnce('Invalid token', undefined, 401);

    await expect(dataSource.getFoo()).rejects.toThrow(AuthenticationError);
  });

  it('throws a ForbiddenError when the response status is 403', async () => {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      getFoo() {
        return this.get('foo');
      }
    }();

    dataSource.httpCache = httpCache;

    fetch.mockResponseOnce('No access', undefined, 403);

    await expect(dataSource.getFoo()).rejects.toThrow(ForbiddenError);
  });

  it('throws an ApolloError when the response status is 500', async () => {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      getFoo() {
        return this.get('foo');
      }
    }();

    dataSource.httpCache = httpCache;

    fetch.mockResponseOnce('Oops', undefined, 500);

    await expect(dataSource.getFoo()).rejects.toThrow(ApolloError);
  });
});
