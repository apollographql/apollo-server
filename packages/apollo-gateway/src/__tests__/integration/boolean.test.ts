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

// TODO: right now the query planner doesn't prune known skip and include points
// eventually we want to do this to prevent downstream fetches that aren't needed
describe('@skip', () => {
  it('supports @skip when a boolean condition is met', async () => {
    const query = gql`
      query GetReviewers {
        topReviews {
          body
          author @skip(if: true) {
            name
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

    expect(data).toEqual({
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
  });

  it('supports @skip when a boolean condition is met (variable driven)', async () => {
    const query = gql`
      query GetReviewers($skip: Boolean!) {
        topReviews {
          body
          author @skip(if: $skip) {
            username
          }
        }
      }
    `;

    const skip = true;
    const { data, queryPlan } = await execute(
      [accounts, books, inventory, product, reviews],
      {
        query,
        variables: { skip },
      },
    );

    expect(data).toEqual({
      topReviews: [
        { body: 'Love it!' },
        { body: 'Too expensive.' },
        { body: 'Could be better.' },
        { body: 'Prefer something else.' },
        { body: 'Wish I had read this before.' },
      ],
    });

    expect(queryPlan).not.toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });

  // Data looks good here, suspect the matcher is incorrect
  it('supports @skip when a boolean condition is not met', async () => {
    const query = gql`
      query GetReviewers {
        topReviews {
          body
          author @skip(if: false) {
            name
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
        { body: 'Love it!', author: { name: 'Ada Lovelace' } },
        { body: 'Too expensive.', author: { name: 'Ada Lovelace' } },
        { body: 'Could be better.', author: { name: 'Alan Turing' } },
        { body: 'Prefer something else.', author: { name: 'Alan Turing' } },
        {
          body: 'Wish I had read this before.',
          author: { name: 'Alan Turing' },
        },
      ],
    });

    expect(queryPlan).toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });

  // Data looks good here, suspect the matcher is incorrect
  it('supports @skip when a boolean condition is not met (variable driven)', async () => {
    const query = gql`
      query GetReviewers($skip: Boolean!) {
        topReviews {
          body
          author @skip(if: $skip) {
            name
          }
        }
      }
    `;

    const skip = false;
    const { data, queryPlan } = await execute(
      [accounts, books, inventory, product, reviews],
      {
        query,
        variables: { skip },
      },
    );

    expect(data).toEqual({
      topReviews: [
        { body: 'Love it!', author: { name: 'Ada Lovelace' } },
        { body: 'Too expensive.', author: { name: 'Ada Lovelace' } },
        { body: 'Could be better.', author: { name: 'Alan Turing' } },
        { body: 'Prefer something else.', author: { name: 'Alan Turing' } },
        {
          body: 'Wish I had read this before.',
          author: { name: 'Alan Turing' },
        },
      ],
    });

    expect(queryPlan).toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });
});

describe('@include', () => {
  it('supports @include when a boolean condition is not met', async () => {
    const query = gql`
      query GetReviewers {
        topReviews {
          body
          author @include(if: false) {
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
        { body: 'Love it!' },
        { body: 'Too expensive.' },
        { body: 'Could be better.' },
        { body: 'Prefer something else.' },
        { body: 'Wish I had read this before.' },
      ],
    });

    expect(queryPlan).not.toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });

  it('supports @include when a boolean condition is not met (variable driven)', async () => {
    const query = gql`
      query GetReviewers($include: Boolean!) {
        topReviews {
          body
          author @include(if: $include) {
            username
          }
        }
      }
    `;

    const include = false;
    const { data, queryPlan } = await execute(
      [accounts, books, inventory, product, reviews],
      {
        query,
        variables: { include },
      },
    );

    expect(data).toEqual({
      topReviews: [
        { body: 'Love it!' },
        { body: 'Too expensive.' },
        { body: 'Could be better.' },
        { body: 'Prefer something else.' },
        { body: 'Wish I had read this before.' },
      ],
    });

    expect(queryPlan).not.toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });

  // Data looks good here, suspect the matcher is incorrect
  // Added the query plan snapshot for a view.
  it('supports @include when a boolean condition is met', async () => {
    const query = gql`
      query GetReviewers {
        topReviews {
          body
          author @include(if: true) {
            name
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
        { body: 'Love it!', author: { name: 'Ada Lovelace' } },
        { body: 'Too expensive.', author: { name: 'Ada Lovelace' } },
        { body: 'Could be better.', author: { name: 'Alan Turing' } },
        { body: 'Prefer something else.', author: { name: 'Alan Turing' } },
        {
          body: 'Wish I had read this before.',
          author: { name: 'Alan Turing' },
        },
      ],
    });

    expect(queryPlan).toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });

  // Data looks good here, suspect the matcher is incorrect
  // Added the query plan snapshot for a view.
  it('supports @include when a boolean condition is met (variable driven)', async () => {
    const query = gql`
      query GetReviewers($include: Boolean!) {
        topReviews {
          body
          author @include(if: $include) {
            name
          }
        }
      }
    `;

    const include = true;
    const { data, queryPlan } = await execute(
      [accounts, books, inventory, product, reviews],
      {
        query,
        variables: { include },
      },
    );

    expect(data).toEqual({
      topReviews: [
        { body: 'Love it!', author: { name: 'Ada Lovelace' } },
        { body: 'Too expensive.', author: { name: 'Ada Lovelace' } },
        { body: 'Could be better.', author: { name: 'Alan Turing' } },
        { body: 'Prefer something else.', author: { name: 'Alan Turing' } },
        {
          body: 'Wish I had read this before.',
          author: { name: 'Alan Turing' },
        },
      ],
    });

    expect(queryPlan).toCallService('accounts');
    expect(queryPlan).toCallService('reviews');
  });
});
