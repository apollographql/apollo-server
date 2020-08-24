import { disableFragmentWarnings } from 'graphql-tag';
import { execute } from '../execution-utils';

beforeAll(() => {
  disableFragmentWarnings();
});
it('supports inline fragments (one level)', async () => {
  const query = `#graphql
    query GetUser {
      me {
        ... on User {
          username
        }
      }
    }
  `;

  const { data, queryPlan } = await execute({
    query,
  });

  expect(data).toEqual({
    me: {
      username: '@ada',
    },
  });

  expect(queryPlan).toCallService('accounts');
});

it('supports inline fragments (multi level)', async () => {
  const query = `#graphql
    query GetUser {
      me {
        ... on User {
          username
          reviews {
            ... on Review {
              body
              product {
                ... on Product {
                  ... on Book {
                    title
                  }
                  ... on Furniture {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const { data, queryPlan } = await execute({
    query,
  });

  expect(data).toEqual({
    me: {
      username: '@ada',
      reviews: [
        { body: 'Love it!', product: { name: 'Table' } },
        { body: 'Too expensive.', product: { name: 'Couch' } },
        { body: 'A classic.', product: { title: 'Design Patterns' } },
      ],
    },
  });

  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
  expect(queryPlan).toCallService('product');
  expect(queryPlan).toCallService('books');
});

it('supports named fragments (one level)', async () => {
  const query = `#graphql
    query GetUser {
      me {
        ...userDetails
      }
    }

    fragment userDetails on User {
      username
    }
  `;

  const { data, queryPlan } = await execute({
    query,
  });

  expect(data).toEqual({
    me: {
      username: '@ada',
    },
  });

  expect(queryPlan).toCallService('accounts');
});

it('supports multiple named fragments (one level, mixed ordering)', async () => {
  const query = `#graphql
    fragment userInfo on User {
      name {
        first
        last
      }
    }
    query GetUser {
      me {
        ...userDetails
        ...userInfo
      }
    }

    fragment userDetails on User {
      username
    }
  `;

  const { data, queryPlan } = await execute({
    query,
  });

  expect(data).toEqual({
    me: {
      username: '@ada',
      name: {
        first: 'Ada',
        last: 'Lovelace',
      }
    },
  });

  expect(queryPlan).toCallService('accounts');
});

it('supports multiple named fragments (multi level, mixed ordering)', async () => {
  const query = `#graphql
    fragment reviewDetails on Review {
      body
    }
    query GetUser {
      me {
        ...userDetails
      }
    }

    fragment userDetails on User {
      username
      reviews {
        ...reviewDetails
      }
    }
  `;

  const { data, queryPlan } = await execute({
    query,
  });

  expect(data).toEqual({
    me: {
      reviews: [
        { body: 'Love it!' },
        { body: 'Too expensive.' },
        { body: 'A classic.' },
      ],
      username: '@ada',
    },
  });

  expect(queryPlan).toCallService('accounts');
});

it('supports variables within fragments', async () => {
  const query = `#graphql
    query GetUser($format: Boolean) {
      me {
        ...userDetails
      }
    }

    fragment userDetails on User {
      username
      reviews {
        body(format: $format)
      }
    }
  `;

  const format = true;
  const { data, queryPlan } = await execute({
    query,
    variables: { format },
  });

  expect(data).toEqual({
    me: {
      username: '@ada',
      reviews: [
        { body: 'Love it!' },
        { body: 'Too expensive.' },
        { body: 'A classic.' },
      ],
    },
  });

  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
});

it('supports root fragments', async () => {
  const query = `#graphql
    query GetUser {
      ... on Query {
        me {
          username
        }
      }
    }
  `;

  const { data, queryPlan } = await execute({
    query,
  });

  expect(data).toEqual({
    me: {
      username: '@ada',
    },
  });

  expect(queryPlan).toCallService('accounts');
});
