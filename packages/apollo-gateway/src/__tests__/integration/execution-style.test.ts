import gql from 'graphql-tag';
import { execute, overrideResolversInService } from '../execution-utils';

import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

async function wait(amount: number): Promise<void> {
  return new Promise(r => setTimeout(r, amount));
}

describe('query', () => {
  it('supports parallel root fields', async () => {
    const query = gql`
      query GetUserAndReviews {
        me {
          username
        }
        topReviews {
          body
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
      me: { username: '@ada' },
      topReviews: [
        { body: 'Love it!' },
        { body: 'Too expensive.' },
        { body: 'Could be better.' },
        { body: 'Prefer something else.' },
        { body: 'Wish I had read this before.' },
      ],
    });

    expect(queryPlan).toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
    // FIXME: determine matcher for execution order
  });
});
