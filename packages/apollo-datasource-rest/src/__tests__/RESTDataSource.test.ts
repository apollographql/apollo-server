import 'apollo-server-env';
import { RESTDataSource } from '../RESTDataSource';

import fetch, { mockFetch, unmockFetch } from '../__mocks__/fetch';
import { HTTPCache } from '../HTTPCache';

describe('RESTDataSource', () => {
  const store = new Map<string, string>();
  let httpCache: HTTPCache;

  beforeAll(() => {
    mockFetch();

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

  afterAll(() => {
    unmockFetch();
  });

  it('returns data as parsed JSON', async () => {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      getFoo() {
        return this.get('foo');
      }
    }();

    dataSource.httpCache = httpCache;

    fetch.mockJSONResponseOnce({ foo: 'bar' });

    const data = await dataSource.getFoo();

    expect(data).toEqual({ foo: 'bar' });
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

  for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
    const dataSource = new class extends RESTDataSource {
      baseURL = 'https://api.example.com';

      getFoo() {
        return this.get('foo');
      }

      postFoo() {
        return this.post('foo');
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
});
