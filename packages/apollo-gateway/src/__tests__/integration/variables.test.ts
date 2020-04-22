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

  expect(errors).toBeUndefined();
  expect(data).toEqual({
    product: {
      name: 'Table',
    },
  });

  expect(queryPlan).toCallService('product');
});

it('supports default variables in a variable definition', async () => {
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

  expect(errors).toBeUndefined();
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
  const { data, errors, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables: { format },
    },
  );

  expect(errors).toBeUndefined();
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

it('works with default variables in the schema', async () => {
  const query = gql`
    query LibraryUser($libraryId: ID!, $userId: ID) {
      library(id: $libraryId) {
        userAccount(id: $userId) {
          id
          name
        }
      }
    }
  `;

  const { data, queryPlan, errors } = await execute(
    [accounts, books, inventory, product, reviews],
    { query, variables: { libraryId: '1' } },
  );

  expect(data).toEqual({
    library: {
      userAccount: {
        id: '1',
        name: 'Ada Lovelace',
      },
    },
  });

  expect(errors).toBeUndefined();
  expect(queryPlan).toCallService('books');
  expect(queryPlan).toCallService('accounts');
});
