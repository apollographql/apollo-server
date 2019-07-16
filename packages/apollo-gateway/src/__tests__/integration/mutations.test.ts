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

function spyOnResolver<T extends string>(resolverMap: any, resolverName: T) {
  return jest.spyOn<any, T>(resolverMap, resolverName).mockName(resolverName);
}

it('supports mutations', async () => {
  const query = gql`
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        reviews {
          product {
            upc
          }
        }
      }
    }
  `;

  const variables = { username: '@complete', password: 'css_completes_me' };
  const { data, errors, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables,
    },
  );

  expect(data).toEqual({
    login: {
      reviews: [
        { product: { upc: '3' } },
        { product: { upc: '1' } },
        { product: { upc: '0262510871' } },
        { product: { upc: '0136291554' } },
      ],
    },
  });

  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
  expect(queryPlan).toCallService('product');
});

it('returning across service boundaries', async () => {
  const query = gql`
    mutation Review($upc: String!, $body: String!) {
      reviewProduct(upc: $upc, body: $body) {
        ... on Furniture {
          name
        }
      }
    }
  `;

  const variables = { upc: '1', body: 'A great table' };
  const { data, errors, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables,
    },
  );

  expect(data).toEqual({
    reviewProduct: {
      name: 'Table',
    },
  });

  expect(queryPlan).toCallService('reviews');
  expect(queryPlan).toCallService('product');
});

it('multiple root mutations', async () => {
  const login = spyOnResolver(accounts.resolvers.Mutation, 'login');
  const reviewProduct = spyOnResolver(
    reviews.resolvers.Mutation,
    'reviewProduct',
  );

  const query = gql`
    mutation LoginAndReview(
      $username: String!
      $password: String!
      $upc: String!
      $body: String!
    ) {
      login(username: $username, password: $password) {
        reviews {
          product {
            upc
          }
        }
      }
      reviewProduct(upc: $upc, body: $body) {
        ... on Furniture {
          name
        }
      }
    }
  `;

  const variables = {
    username: '@complete',
    password: 'css_completes_me',
    upc: '1',
    body: 'A great table.',
  };
  const { data, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables,
    },
  );

  expect(data).toEqual({
    login: {
      reviews: [
        { product: { upc: '3' } },
        { product: { upc: '1' } },
        { product: { upc: '0262510871' } },
        { product: { upc: '0136291554' } },
      ],
    },
    reviewProduct: {
      name: 'Table',
    },
  });

  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
  expect(queryPlan).toCallService('product');

  expect(login).toHaveBeenCalledBefore(reviewProduct);
});

it('multiple root mutations with correct service order', async () => {
  const reviewsMutations = reviews.resolvers.Mutation;
  const reviewProduct = spyOnResolver(reviewsMutations, 'reviewProduct');
  const login = spyOnResolver(accounts.resolvers.Mutation, 'login');
  const updateReview = spyOnResolver(reviewsMutations, 'updateReview');
  const deleteReview = spyOnResolver(reviewsMutations, 'deleteReview');

  const query = gql`
    mutation LoginAndReview(
      $upc: String!
      $body: String!
      $updatedReview: UpdateReviewInput!
      $username: String!
      $password: String!
      $reviewId: ID!
    ) {
      reviewProduct(upc: $upc, body: $body) {
        ... on Furniture {
          upc
        }
      }
      updateReview(review: $updatedReview) {
        id
        body
      }
      login(username: $username, password: $password) {
        reviews {
          product {
            upc
          }
        }
      }
      deleteReview(id: $reviewId)
    }
  `;

  const variables = {
    upc: '1',
    body: 'A great table.',
    updatedReview: {
      id: '1',
      body: 'An excellent table.',
    },
    username: '@complete',
    password: 'css_completes_me',
    reviewId: '6',
  };
  const { data, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
      variables,
    },
  );

  expect(data).toEqual({
    deleteReview: true,
    login: {
      reviews: [
        { product: { upc: '3' } },
        { product: { upc: '1' } },
        { product: { upc: '0262510871' } },
        { product: { upc: '0136291554' } },
      ],
    },
    reviewProduct: {
      upc: '1',
    },
    updateReview: {
      body: 'An excellent table.',
      id: '1',
    },
  });

  expect(queryPlan).toMatchInlineSnapshot(`
    QueryPlan {
      Sequence {
        Fetch(service: "reviews") {
          {
            reviewProduct(upc: $upc, body: $body) {
              __typename
              ... on Furniture {
                upc
              }
            }
            updateReview(review: $updatedReview) {
              id
              body
            }
          }
        },
        Fetch(service: "accounts") {
          {
            login(username: $username, password: $password) {
              __typename
              id
            }
          }
        },
        Flatten(path: "login") {
          Fetch(service: "reviews") {
            {
              ... on User {
                __typename
                id
              }
            } =>
            {
              ... on User {
                reviews {
                  product {
                    __typename
                    ... on Book {
                      __typename
                      isbn
                    }
                    ... on Furniture {
                      upc
                    }
                  }
                }
              }
            }
          },
        },
        Flatten(path: "login.reviews.@.product") {
          Fetch(service: "product") {
            {
              ... on Book {
                __typename
                isbn
              }
            } =>
            {
              ... on Book {
                upc
              }
            }
          },
        },
        Fetch(service: "reviews") {
          {
            deleteReview(id: $reviewId)
          }
        },
      },
    }
  `);

  expect(reviewProduct).toHaveBeenCalledBefore(updateReview);
  expect(updateReview).toHaveBeenCalledBefore(login);
  expect(login).toHaveBeenCalledBefore(deleteReview);
});
