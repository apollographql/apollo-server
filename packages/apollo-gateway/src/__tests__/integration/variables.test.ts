import gql from 'graphql-tag';
import { execute } from '../execution-utils';

import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

it('passes variables to root fields', async () => {
  const query = gql`
    query GetProduct($upc: String!) {
      product(upc: $upc) {
        name
      }
    }
  `;

  const upc = '1';
  const { data, errors, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables: { upc },
    },
  );

  expect(data).toEqual({
    product: {
      name: 'Table',
    },
  });

  expect(queryPlan).toCallService('product');
});

it('supports default variables', async () => {
  const query = gql`
    query GetProduct($upc: String = "1") {
      product(upc: $upc) {
        name
      }
    }
  `;

  const { data, errors, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
    },
  );

  expect(data).toEqual({
    product: {
      name: 'Table',
    },
  });

  expect(queryPlan).toCallService('product');
});

it('passes variables to nested services', async () => {
  const query = gql`
    query GetProductsForUser($format: Boolean) {
      me {
        reviews {
          body(format: $format)
        }
      }
    }
  `;

  const format = true;
  const { data, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables: { format },
    },
  );

  expect(data).toEqual({
    me: {
      reviews: [
        { body: 'Love it!' },
        { body: 'Too expensive.' },
        {
          body: 'A classic.',
        },
      ],
    },
  });

  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
});
