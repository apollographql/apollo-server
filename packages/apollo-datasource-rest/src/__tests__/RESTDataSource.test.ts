import { fetch, Request, URL } from '__mocks__/apollo-server-env';

import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-errors';
import { RESTDataSource, RequestOptions } from '../RESTDataSource';

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

  describe('constructing requests', () => {
    it('interprets paths relative to the base URL', async () => {
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

    it('interprets paths with a leading slash relative to the base URL', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com/bar';

        getFoo() {
          return this.get('/foo');
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();

      await dataSource.getFoo();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0].url).toEqual(
        'https://api.example.com/bar/foo',
      );
    });

    it('adds a trailing slash to the base URL if needed', async () => {
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

    it('allows computing a dynamic base URL', async () => {
      const dataSource = new class extends RESTDataSource {
        get baseURL() {
          if (this.context.env === 'development') {
            return 'https://api-dev.example.com';
          } else {
            return 'https://api.example.com';
          }
        }

        getFoo() {
          return this.get('foo');
        }
      }();

      dataSource.context = { env: 'development' };
      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();
      await dataSource.getFoo();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0].url).toEqual(
        'https://api-dev.example.com/foo',
      );
    });

    it('allows resolving a base URL asynchronously', async () => {
      const dataSource = new class extends RESTDataSource {
        async resolveURL(request: RequestOptions) {
          if (!this.baseURL) {
            this.baseURL = 'https://api.example.com';
          }
          return super.resolveURL(request);
        }

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

    it('allows passing in query string parameters', async () => {
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

    it('allows setting default query string parameters', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        willSendRequest(request: RequestOptions) {
          request.params.set('api_key', this.context.token);
        }

        getFoo() {
          return this.get('foo', { a: 1 });
        }
      }();

      dataSource.context = { token: 'secret' };
      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();

      await dataSource.getFoo();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0].url).toEqual(
        'https://api.example.com/foo?a=1&api_key=secret',
      );
    });

    it('allows setting default fetch options', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        willSendRequest(request: RequestOptions) {
          request.credentials = 'include';
        }

        getFoo() {
          return this.get('foo');
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();

      await dataSource.getFoo();

      expect(fetch.mock.calls.length).toEqual(1);
      // FIXME: request.credentials is not supported by node-fetch
      // expect(fetch.mock.calls[0][0].credentials).toEqual('include');
    });

    it('allows setting request headers', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        willSendRequest(request: RequestOptions) {
          request.headers.set('Authorization', this.context.token);
        }

        getFoo() {
          return this.get('foo');
        }
      }();

      dataSource.context = { token: 'secret' };
      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();

      await dataSource.getFoo();

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0].headers.get('Authorization')).toEqual(
        'secret',
      );
    });

    it('serializes a request body that is an object as JSON', async () => {
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
      expect(fetch.mock.calls[0][0].body).toEqual(
        JSON.stringify({ foo: 'bar' }),
      );
      expect(fetch.mock.calls[0][0].headers.get('Content-Type')).toEqual(
        'application/json',
      );
    });

    it('serializes a request body that is an array as JSON', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        postFoo(foo) {
          return this.post('foo', foo);
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();

      await dataSource.postFoo(['foo', 'bar']);

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0].url).toEqual('https://api.example.com/foo');
      expect(fetch.mock.calls[0][0].body).toEqual(
        JSON.stringify(['foo', 'bar']),
      );
      expect(fetch.mock.calls[0][0].headers.get('Content-Type')).toEqual(
        'application/json',
      );
    });

    it('serializes a request body that has a toJSON method as JSON', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        postFoo(foo) {
          return this.post('foo', foo);
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();

      class Model {
        constructor(public baz: any) {}

        toJSON() {
          return {
            foo: this.baz,
          };
        }
      }
      const model = new Model('bar');

      await dataSource.postFoo(model);

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0].url).toEqual('https://api.example.com/foo');
      expect(fetch.mock.calls[0][0].body).toEqual(
        JSON.stringify({ foo: 'bar' }),
      );
      expect(fetch.mock.calls[0][0].headers.get('Content-Type')).toEqual(
        'application/json',
      );
    });

    it('does not serialize a request body that is not an object', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        postFoo(foo) {
          return this.post('foo', foo);
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();

      class FormData {}
      const form = new FormData();

      await dataSource.postFoo(form);

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0].url).toEqual('https://api.example.com/foo');
      expect(fetch.mock.calls[0][0].body).not.toEqual('{}');
      expect(fetch.mock.calls[0][0].headers.get('Content-Type')).not.toEqual(
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
  });

  describe('response parsing', () => {
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

    it('returns data as parsed JSON when Content-Type is application/hal+json', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        getFoo() {
          return this.get('foo');
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce(
        { foo: 'bar' },
        { 'Content-Type': 'application/hal+json' },
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
  });

  describe('memoization', () => {
    it('deduplicates requests with the same cache key', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        getFoo(id: number) {
          return this.get(`foo/${id}`);
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();

      await Promise.all([dataSource.getFoo(1), dataSource.getFoo(1)]);

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0].url).toEqual(
        'https://api.example.com/foo/1',
      );
    });

    it('does not deduplicate requests with a different cache key', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        getFoo(id: number) {
          return this.get(`foo/${id}`);
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();
      fetch.mockJSONResponseOnce();

      await Promise.all([dataSource.getFoo(1), dataSource.getFoo(2)]);

      expect(fetch.mock.calls.length).toEqual(2);
      expect(fetch.mock.calls[0][0].url).toEqual(
        'https://api.example.com/foo/1',
      );
      expect(fetch.mock.calls[1][0].url).toEqual(
        'https://api.example.com/foo/2',
      );
    });

    it('does not deduplicate non-GET requests', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        postFoo(id: number) {
          return this.post(`foo/${id}`);
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();
      fetch.mockJSONResponseOnce();

      await Promise.all([dataSource.postFoo(1), dataSource.postFoo(1)]);

      expect(fetch.mock.calls.length).toEqual(2);
    });

    it('non-GET request removes memoized request with the same cache key', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        getFoo(id: number) {
          return this.get(`foo/${id}`);
        }

        postFoo(id: number) {
          return this.post(`foo/${id}`);
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();
      fetch.mockJSONResponseOnce();
      fetch.mockJSONResponseOnce();

      await Promise.all([
        dataSource.getFoo(1),
        dataSource.postFoo(1),
        dataSource.getFoo(1),
      ]);

      expect(fetch.mock.calls.length).toEqual(3);
      expect(fetch.mock.calls[0][0].url).toEqual(
        'https://api.example.com/foo/1',
      );
      expect(fetch.mock.calls[2][0].url).toEqual(
        'https://api.example.com/foo/1',
      );
    });

    it('allows specifying a custom cache key', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        cacheKeyFor(request: Request) {
          const url = new URL(request.url);
          url.search = undefined;
          return url.toString();
        }

        getFoo(id: number, apiKey: string) {
          return this.get(`foo/${id}`, { api_key: apiKey });
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();

      await Promise.all([
        dataSource.getFoo(1, 'secret'),
        dataSource.getFoo(1, 'anotherSecret'),
      ]);

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0].url).toEqual(
        'https://api.example.com/foo/1?api_key=secret',
      );
    });
  });

  describe('error handling', () => {
    it('throws an AuthenticationError when the response status is 401', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        getFoo() {
          return this.get('foo');
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockResponseOnce('Invalid token', undefined, 401);

      const result = dataSource.getFoo();
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
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        getFoo() {
          return this.get('foo');
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockResponseOnce('No access', undefined, 403);

      const result = dataSource.getFoo();
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
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        getFoo() {
          return this.get('foo');
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockResponseOnce('Oops', undefined, 500);

      const result = dataSource.getFoo();
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
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        getFoo() {
          return this.get('foo');
        }
      }();

      dataSource.httpCache = httpCache;

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

      const result = dataSource.getFoo();
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
});
