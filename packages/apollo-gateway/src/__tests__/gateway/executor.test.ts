import gql from 'graphql-tag';
import { ApolloGateway } from '../../';

import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

describe('ApolloGateway executor', () => {
  it('validates requests prior to execution', async () => {
    const gateway = new ApolloGateway({
      localServiceList: [accounts, books, inventory, product, reviews],
    });

    const { executor } = await gateway.load();

    const { errors } = await executor({
      document: gql`
        query InvalidVariables($first: Int!) {
          topReviews(first: $first) {
            body
          }
        }
      `,
      request: {
        variables: { first: '3' },
      },
      queryHash: 'hashed',
      context: null,
      cache: {} as any,
    });

    expect(errors![0].message).toMatch(
      'Variable "$first" got invalid value "3"; Expected type Int.',
    );
  });
});
