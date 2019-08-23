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
      fragment Metadata on MetadataOrError {
        ... on KeyValue {
          key
          value
        }
        ... on Error {
          code
          message
        }
      }

      query ProducsWithMetadata {
        topProducts(first: 10) {
          upc
          ... on Book {
            metadata {
              ...Metadata
            }
          }
          ... on Furniture {
            metadata {
              ...Metadata
            }
          }
          reviews {
            metadata {
              ...Metadata
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

    expect(queryPlan).toMatchInlineSnapshot(`
      QueryPlan {
        Sequence {
          Fetch(service: "product") {
            {
              topProducts(first: 10) {
                __typename
                ... on Book {
                  upc
                  __typename
                  isbn
                }
                ... on Furniture {
                  upc
                  metadata {
                    __typename
                    ... on KeyValue {
                      key
                      value
                    }
                    ... on Error {
                      code
                      message
                    }
                  }
                  __typename
                }
              }
            }
          },
          Parallel {
            Flatten(path: "topProducts.@") {
              Fetch(service: "books") {
                {
                  ... on Book {
                    __typename
                    isbn
                  }
                } =>
                {
                  ... on Book {
                    metadata {
                      __typename
                      ... on KeyValue {
                        key
                        value
                      }
                      ... on Error {
                        code
                        message
                      }
                    }
                  }
                }
              },
            },
            Flatten(path: "topProducts.@") {
              Fetch(service: "reviews") {
                {
                  ... on Book {
                    __typename
                    isbn
                  }
                  ... on Furniture {
                    __typename
                    upc
                  }
                } =>
                {
                  ... on Book {
                    reviews {
                      metadata {
                        __typename
                        ... on KeyValue {
                          key
                          value
                        }
                        ... on Error {
                          code
                          message
                        }
                      }
                    }
                  }
                  ... on Furniture {
                    reviews {
                      metadata {
                        __typename
                        ... on KeyValue {
                          key
                          value
                        }
                        ... on Error {
                          code
                          message
                        }
                      }
                    }
                  }
                }
              },
            },
          },
        },
      }
    `);

    const [furniture, , , , book] = data!.topProducts;

    // Sanity check, referenceable ID
    expect(furniture.upc).toEqual('1');
    // Value type resolves from the correct service
    expect(furniture.metadata[0]).toEqual({
      key: 'Condition',
      value: 'excellent',
    });

    // Value type from a different service (reviews) also resolves correctly
    expect(furniture.reviews[0].metadata[0]).toEqual({
      code: 418,
      message: "I'm a teapot",
    });

    // Sanity check, referenceable ID
    expect(book.upc).toEqual('0136291554');
    // Value type as a union resolves correctly
    expect(book.metadata).toEqual([
      {
        key: 'Condition',
        value: 'used',
      },
      {
        code: 401,
        message: 'Unauthorized',
      },
    ]);

    expect(queryPlan).toCallService('product');
    expect(queryPlan).toCallService('books');
    expect(queryPlan).toCallService('reviews');
  });
});
