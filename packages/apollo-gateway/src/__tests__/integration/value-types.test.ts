import gql from 'graphql-tag';
import { execute } from '../execution-utils';

import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

import { astSerializer, queryPlanSerializer } from '../../snapshotSerializers';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(queryPlanSerializer);

describe('value types', () => {
  it('resolves value types within their respective services', async () => {
    const query = gql`
      query Todo {
        topProducts(first: 10) {
          upc
          price
          ... on Book {
            metadata {
              key
              value
            }
          }
          ... on Furniture {
            metadata {
              key
              value
            }
          }
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
    expect(data.topProducts[0].upc).toEqual('1');
    expect(data.topProducts[0].metadata[0]).toEqual({
      key: 'Condition',
      value: 'excellent',
    });
    expect(data.topProducts[4].upc).toEqual('0136291554');
    expect(data.topProducts[4].metadata[0]).toEqual({
      key: 'Condition',
      value: 'used',
    });
  });
});
