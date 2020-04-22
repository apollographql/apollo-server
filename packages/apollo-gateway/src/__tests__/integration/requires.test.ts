import gql from 'graphql-tag';
import { execute } from '../execution-utils';
import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

it('supports passing additional fields defined by a requires', async () => {
  const query = gql`
    query GetReviwedBookNames {
      me {
        reviews {
          product {
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
        { product: {} },
        { product: {} },
        {
          product: {
            name: 'Design Patterns (1995)',
          },
        },
      ],
    },
  });

  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
  expect(queryPlan).toCallService('product');
  expect(queryPlan).toCallService('books');
});
