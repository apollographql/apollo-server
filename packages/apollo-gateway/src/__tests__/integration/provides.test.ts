import gql from 'graphql-tag';
import { execute, overrideResolversInService } from '../execution-utils';

import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

it('does not have to go to another service when field is given', async () => {
  const query = gql`
    query GetReviewers {
      topReviews {
        author {
          username
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
    topReviews: [
      { author: { username: '@ada' } },
      { author: { username: '@ada' } },
      { author: { username: '@complete' } },
      { author: { username: '@complete' } },
      { author: { username: '@complete' } },
    ],
  });

  expect(queryPlan).not.toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
});

it('does not load fields provided even when going to other service', async () => {
  const username = jest.fn();
  const localAccounts = overrideResolversInService(accounts, {
    User: {
      username,
    },
  });

  const query = gql`
    query GetReviewers {
      topReviews {
        author {
          username
          name
        }
      }
    }
  `;

  const { data, queryPlan } = await execute(
    [localAccounts, books, inventory, product, reviews],
    {
      query,
    },
  );

  expect(data).toEqual({
    topReviews: [
      { author: { username: '@ada', name: 'Ada Lovelace' } },
      { author: { username: '@ada', name: 'Ada Lovelace' } },
      { author: { username: '@complete', name: 'Alan Turing' } },
      { author: { username: '@complete', name: 'Alan Turing' } },
      { author: { username: '@complete', name: 'Alan Turing' } },
    ],
  });

  expect(username).not.toHaveBeenCalled();
  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
});
