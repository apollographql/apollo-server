import gql from 'graphql-tag';
import { execute } from '../execution-utils';
import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

it('handles an abstract type from the base service', async () => {
  const query = gql`
    query GetProduct($upc: String!) {
      product(upc: $upc) {
        upc
        name
        price
      }
    }
  `;

  const upc = '1';
  const { data, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables: { upc },
    },
  );

  expect(data).toEqual({
    product: {
      upc,
      name: 'Table',
      price: '899',
    },
  });

  expect(queryPlan).toCallService('product');
});

it('can request fields on extended interfaces', async () => {
  const query = gql`
    query GetProduct($upc: String!) {
      product(upc: $upc) {
        inStock
      }
    }
  `;

  const upc = '1';

  const { data, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables: { upc },
    },
  );

  expect(data).toEqual({ product: { inStock: true } });
  expect(queryPlan).toCallService('product');
  expect(queryPlan).toCallService('inventory');
});

it('can request fields on extended types that implement an interface', async () => {
  const query = gql`
    query GetProduct($upc: String!) {
      product(upc: $upc) {
        inStock
        ... on Furniture {
          isHeavy
        }
      }
    }
  `;

  const upc = '1';
  const { data, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables: { upc },
    },
  );

  expect(data).toEqual({ product: { inStock: true, isHeavy: false } });
  expect(queryPlan).toCallService('product');
  expect(queryPlan).toCallService('inventory');
});

it('prunes unfilled type conditions', async () => {
  const query = gql`
    query GetProduct($upc: String!) {
      product(upc: $upc) {
        inStock
        ... on Furniture {
          isHeavy
        }
        ... on Book {
          isCheckedOut
        }
      }
    }
  `;

  const upc = '1';
  const { data, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables: { upc },
    },
  );

  expect(data).toEqual({ product: { inStock: true, isHeavy: false } });
  expect(queryPlan).toCallService('product');
  expect(queryPlan).toCallService('inventory');
});

it('fetches interfaces returned from other services', async () => {
  const query = gql`
    query GetUserAndProducts {
      me {
        reviews {
          product {
            price
            ... on Book {
              title
            }
          }
        }
      }
    }
  `;

  const { data, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
    },
  );

  expect(data).toEqual({
    me: {
      reviews: [
        { product: { price: '899' } },
        { product: { price: '1299' } },
        { product: { price: '49', title: 'Design Patterns' } },
      ],
    },
  });

  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
  expect(queryPlan).toCallService('product');
});

it('fetches composite fields from a foreign type casted to an interface [@provides field]', async () => {
  const query = gql`
    query GetUserAndProducts {
      me {
        reviews {
          product {
            price
            ... on Book {
              name
            }
          }
        }
      }
    }
  `;

  const { data, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
    },
  );

  expect(data).toEqual({
    me: {
      reviews: [
        { product: { price: '899' } },
        { product: { price: '1299' } },
        { product: { price: '49', name: 'Design Patterns (1995)' } },
      ],
    },
  });

  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
  expect(queryPlan).toCallService('product');
});

it('allows for extending an interface from another service with fields', async () => {
  const query = gql`
    query GetProduct($upc: String!) {
      product(upc: $upc) {
        reviews {
          body
        }
      }
    }
  `;

  const upc = '1';
  const { data, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables: { upc },
    },
  );

  expect(data).toEqual({
    product: {
      reviews: [{ body: 'Love it!' }, { body: 'Prefer something else.' }],
    },
  });

  expect(queryPlan).toCallService('reviews');
  expect(queryPlan).toCallService('product');
});

describe('unions', () => {
  it('handles unions from the same service', async () => {
    const query = gql`
      query GetUserAndProducts {
        me {
          reviews {
            product {
              price
              ... on Furniture {
                brand {
                  ... on Ikea {
                    asile
                  }
                  ... on Amazon {
                    referrer
                  }
                }
              }
            }
          }
        }
      }
    `;

    const { data, queryPlan } = await execute(
      [accounts, books, inventory, product, reviews],
      {
        query,
      },
    );

    expect(data).toEqual({
      me: {
        reviews: [
          { product: { price: '899', brand: { asile: 10 } } },
          {
            product: {
              price: '1299',
              brand: { referrer: 'https://canopy.co' },
            },
          },
          { product: { price: '49' } },
        ],
      },
    });

    expect(queryPlan).toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
    expect(queryPlan).toCallService('product');
  });

  // FIXME: turn back on when extending unions is supported in composition
  it.todo('fetches unions across services');
  // async () => {
  //   const query = gql`
  //     query GetUserAndProducts {
  //       me {
  //         account {
  //           ... on LibraryAccount {
  //             library {
  //               name
  //             }
  //           }
  //           ... on SMSAccount {
  //             number
  //           }
  //         }
  //       }
  //     }
  //   `;

  //   const { data, queryPlan } = await execute(
  //     [accounts, books, inventory, product, reviews],
  //     {
  //       query,
  //     },
  //   );

  //   expect(data).toEqual({
  //     me: {
  //       account: {
  //         library: {
  //           name: 'NYC Public Library',
  //         },
  //       },
  //     },
  //   });

  //   expect(queryPlan).toCallService('accounts');
  //   expect(queryPlan).toCallService('books');
  // });
});
