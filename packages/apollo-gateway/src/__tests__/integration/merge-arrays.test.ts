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
  it('supports arrays', async () => {
    const query = gql`
      query MergeArrays {
        me {
          # goodAddress
          goodDescription
          metadata {
            address
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
        goodDescription: true,
        metadata: [
          {
            address: '1',
          },
        ],
      },
    });

    expect(queryPlan).toCallService('accounts');
  });
});
