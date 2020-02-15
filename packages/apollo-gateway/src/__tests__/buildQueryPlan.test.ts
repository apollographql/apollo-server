import path from 'path';
import { GraphQLSchema, GraphQLError } from 'graphql';
import {
  GraphQLSchemaModule,
  GraphQLSchemaValidationError,
} from 'apollo-graphql';
import gql from 'graphql-tag';
import { composeServices, buildFederatedSchema } from '@apollo/federation';

import { buildQueryPlan, buildOperationContext } from '../buildQueryPlan';

import { LocalGraphQLDataSource } from '../datasources/LocalGraphQLDataSource';
import { astSerializer, queryPlanSerializer } from '../snapshotSerializers';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(queryPlanSerializer);

function buildLocalService(modules: GraphQLSchemaModule[]) {
  const schema = buildFederatedSchema(modules);
  return new LocalGraphQLDataSource(schema);
}

describe('buildQueryPlan', () => {
  let schema: GraphQLSchema;

  beforeEach(() => {
    const serviceMap = Object.fromEntries(
      ['accounts', 'product', 'inventory', 'reviews', 'books'].map(
        serviceName => {
          return [
            serviceName,
            buildLocalService([
              require(path.join(
                __dirname,
                '__fixtures__/schemas',
                serviceName,
              )),
            ]),
          ] as [string, LocalGraphQLDataSource];
        },
      ),
    );

    let errors: GraphQLError[];
    ({ schema, errors } = composeServices(
      Object.entries(serviceMap).map(([serviceName, service]) => ({
        name: serviceName,
        typeDefs: service.sdl(),
      })),
    ));

    if (errors && errors.length > 0) {
      throw new GraphQLSchemaValidationError(errors);
    }
  });

  it(`should use a single fetch when requesting a root field from one service`, () => {
    const query = gql`
      query {
        me {
          name
        }
      }
    `;

    const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

    expect(queryPlan).toMatchInlineSnapshot(`
      QueryPlan {
        Fetch(service: "accounts") {
          {
            me {
              name
            }
          }
        },
      }
    `);
  });

  it(`should use two independent fetches when requesting root fields from two services`, () => {
    const query = gql`
      query {
        me {
          name
        }
        topProducts {
          name
        }
      }
    `;

    const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

    expect(queryPlan).toMatchInlineSnapshot(`
      QueryPlan {
        Parallel {
          Fetch(service: "accounts") {
            {
              me {
                name
              }
            }
          },
          Sequence {
            Fetch(service: "product") {
              {
                topProducts {
                  __typename
                  ... on Book {
                    __typename
                    isbn
                  }
                  ... on Furniture {
                    name
                  }
                }
              }
            },
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
                    __typename
                    isbn
                    title
                    year
                  }
                }
              },
            },
            Flatten(path: "topProducts.@") {
              Fetch(service: "product") {
                {
                  ... on Book {
                    __typename
                    isbn
                    title
                    year
                  }
                } =>
                {
                  ... on Book {
                    name
                  }
                }
              },
            },
          },
        },
      }
    `);
  });

  it(`should use a single fetch when requesting multiple root fields from the same service`, () => {
    const query = gql`
      query {
        topProducts {
          name
        }
        product(upc: "1") {
          name
        }
      }
    `;

    const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

    expect(queryPlan).toMatchInlineSnapshot(`
      QueryPlan {
        Sequence {
          Fetch(service: "product") {
            {
              topProducts {
                __typename
                ... on Book {
                  __typename
                  isbn
                }
                ... on Furniture {
                  name
                }
              }
              product(upc: "1") {
                __typename
                ... on Book {
                  __typename
                  isbn
                }
                ... on Furniture {
                  name
                }
              }
            }
          },
          Parallel {
            Sequence {
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
                      __typename
                      isbn
                      title
                      year
                    }
                  }
                },
              },
              Flatten(path: "topProducts.@") {
                Fetch(service: "product") {
                  {
                    ... on Book {
                      __typename
                      isbn
                      title
                      year
                    }
                  } =>
                  {
                    ... on Book {
                      name
                    }
                  }
                },
              },
            },
            Sequence {
              Flatten(path: "product") {
                Fetch(service: "books") {
                  {
                    ... on Book {
                      __typename
                      isbn
                    }
                  } =>
                  {
                    ... on Book {
                      __typename
                      isbn
                      title
                      year
                    }
                  }
                },
              },
              Flatten(path: "product") {
                Fetch(service: "product") {
                  {
                    ... on Book {
                      __typename
                      isbn
                      title
                      year
                    }
                  } =>
                  {
                    ... on Book {
                      name
                    }
                  }
                },
              },
            },
          },
        },
      }
    `);
  });

  it(`should use a single fetch when requesting relationship subfields from the same service`, () => {
    const query = gql`
      query {
        topReviews {
          body
          author {
            reviews {
              body
            }
          }
        }
      }
    `;

    const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

    expect(queryPlan).toMatchInlineSnapshot(`
      QueryPlan {
        Fetch(service: "reviews") {
          {
            topReviews {
              body
              author {
                reviews {
                  body
                }
              }
            }
          }
        },
      }
    `);
  });

  it(`should use a single fetch when requesting relationship subfields and provided keys from the same service`, () => {
    const query = gql`
      query {
        topReviews {
          body
          author {
            id
            reviews {
              body
            }
          }
        }
      }
    `;

    const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

    expect(queryPlan).toMatchInlineSnapshot(`
      QueryPlan {
        Fetch(service: "reviews") {
          {
            topReviews {
              body
              author {
                id
                reviews {
                  body
                }
              }
            }
          }
        },
      }
    `);
  });

  describe(`when requesting an extension field from another service`, () => {
    it(`should add the field's representation requirements to the parent selection set and use a dependent fetch`, () => {
      const query = gql`
        query {
          me {
            name
            reviews {
              body
            }
          }
        }
      `;

      const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

      expect(queryPlan).toMatchInlineSnapshot(`
        QueryPlan {
          Sequence {
            Fetch(service: "accounts") {
              {
                me {
                  name
                  __typename
                  id
                }
              }
            },
            Flatten(path: "me") {
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
                      body
                    }
                  }
                }
              },
            },
          },
        }
      `);
    });

    describe(`when the parent selection set is empty`, () => {
      it(`should add the field's requirements to the parent selection set and use a dependent fetch`, () => {
        const query = gql`
          query {
            me {
              reviews {
                body
              }
            }
          }
        `;

        const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

        expect(queryPlan).toMatchInlineSnapshot(`
          QueryPlan {
            Sequence {
              Fetch(service: "accounts") {
                {
                  me {
                    __typename
                    id
                  }
                }
              },
              Flatten(path: "me") {
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
                        body
                      }
                    }
                  }
                },
              },
            },
          }
        `);
      });
    });

    // TODO: Ask martijn about the meaning of this test
    it(`should only add requirements once`, () => {
      const query = gql`
        query {
          me {
            reviews {
              body
            }
            numberOfReviews
          }
        }
      `;

      const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

      expect(queryPlan).toMatchInlineSnapshot(`
        QueryPlan {
          Sequence {
            Fetch(service: "accounts") {
              {
                me {
                  __typename
                  id
                }
              }
            },
            Flatten(path: "me") {
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
                      body
                    }
                    numberOfReviews
                  }
                }
              },
            },
          },
        }
      `);
    });
  });

  describe(`when requesting a composite field with subfields from another service`, () => {
    it(`should add key fields to the parent selection set and use a dependent fetch`, () => {
      const query = gql`
        query {
          topReviews {
            body
            author {
              name
            }
          }
        }
      `;

      const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

      expect(queryPlan).toMatchInlineSnapshot(`
        QueryPlan {
          Sequence {
            Fetch(service: "reviews") {
              {
                topReviews {
                  body
                  author {
                    __typename
                    id
                  }
                }
              }
            },
            Flatten(path: "topReviews.@.author") {
              Fetch(service: "accounts") {
                {
                  ... on User {
                    __typename
                    id
                  }
                } =>
                {
                  ... on User {
                    name
                  }
                }
              },
            },
          },
        }
      `);
    });

    describe(`when requesting a field defined in another service which requires a field in the base service`, () => {
      it(`should add the field provided by base service in first Fetch`, () => {
        const query = gql`
          query {
            topCars {
              retailPrice
            }
          }
        `;

        const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

        expect(queryPlan).toMatchInlineSnapshot(`
          QueryPlan {
            Sequence {
              Fetch(service: "product") {
                {
                  topCars {
                    __typename
                    id
                    price
                  }
                }
              },
              Flatten(path: "topCars.@") {
                Fetch(service: "reviews") {
                  {
                    ... on Car {
                      __typename
                      id
                      price
                    }
                  } =>
                  {
                    ... on Car {
                      retailPrice
                    }
                  }
                },
              },
            },
          }
        `);
      });
    });

    describe(`when the parent selection set is empty`, () => {
      it(`should add key fields to the parent selection set and use a dependent fetch`, () => {
        const query = gql`
          query {
            topReviews {
              author {
                name
              }
            }
          }
        `;

        const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

        expect(queryPlan).toMatchInlineSnapshot(`
          QueryPlan {
            Sequence {
              Fetch(service: "reviews") {
                {
                  topReviews {
                    author {
                      __typename
                      id
                    }
                  }
                }
              },
              Flatten(path: "topReviews.@.author") {
                Fetch(service: "accounts") {
                  {
                    ... on User {
                      __typename
                      id
                    }
                  } =>
                  {
                    ... on User {
                      name
                    }
                  }
                },
              },
            },
          }
        `);
      });
    });
  });
  describe(`when requesting a relationship field with extension subfields from a different service`, () => {
    it(`should first fetch the object using a key from the base service and then pass through the requirements`, () => {
      const query = gql`
        query {
          topReviews {
            author {
              birthDate
            }
          }
        }
      `;

      const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

      expect(queryPlan).toMatchInlineSnapshot(`
        QueryPlan {
          Sequence {
            Fetch(service: "reviews") {
              {
                topReviews {
                  author {
                    __typename
                    id
                  }
                }
              }
            },
            Flatten(path: "topReviews.@.author") {
              Fetch(service: "accounts") {
                {
                  ... on User {
                    __typename
                    id
                  }
                } =>
                {
                  ... on User {
                    birthDate
                  }
                }
              },
            },
          },
        }
      `);
    });
  });

  describe(`for abstract types`, () => {
    // GraphQLError: Cannot query field "isbn" on type "Book"
    // Probably an issue with extending / interfaces in composition. None of the fields from the base Book type
    // are showing up in the resulting schema.
    it(`should add __typename when fetching objects of an interface type from a service`, () => {
      const query = gql`
        query {
          topProducts {
            price
          }
        }
      `;

      const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

      expect(queryPlan).toMatchInlineSnapshot(`
        QueryPlan {
          Fetch(service: "product") {
            {
              topProducts {
                __typename
                ... on Book {
                  price
                }
                ... on Furniture {
                  price
                }
              }
            }
          },
        }
      `);
    });
  });

  // GraphQLError: Cannot query field "isbn" on type "Book"
  // Probably an issue with extending / interfaces in composition. None of the fields from the base Book type
  // are showing up in the resulting schema.
  it(`should break up when traversing an extension field on an interface type from a service`, () => {
    const query = gql`
      query {
        topProducts {
          price
          reviews {
            body
          }
        }
      }
    `;

    const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

    expect(queryPlan).toMatchInlineSnapshot(`
      QueryPlan {
        Sequence {
          Fetch(service: "product") {
            {
              topProducts {
                __typename
                ... on Book {
                  price
                  __typename
                  isbn
                }
                ... on Furniture {
                  price
                  __typename
                  upc
                }
              }
            }
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
                    body
                  }
                }
                ... on Furniture {
                  reviews {
                    body
                  }
                }
              }
            },
          },
        },
      }
    `);
  });

  it(`interface fragments should expand into possible types only`, () => {
    const query = gql`
      query {
        books {
          ... on Product {
            name
            ... on Furniture {
              upc
            }
          }
        }
      }
    `;

    const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

    expect(queryPlan).toMatchInlineSnapshot(`
      QueryPlan {
        Sequence {
          Fetch(service: "books") {
            {
              books {
                __typename
                isbn
                title
                year
              }
            }
          },
          Flatten(path: "books.@") {
            Fetch(service: "product") {
              {
                ... on Book {
                  __typename
                  isbn
                  title
                  year
                }
              } =>
              {
                ... on Book {
                  name
                }
              }
            },
          },
        },
      }
    `);
  });

  it(`interface inside interface should expand into possible types only`, () => {
    const query = gql`
      query {
        product(upc: "") {
          details {
            country
          }
        }
      }
    `;

    const queryPlan = buildQueryPlan(buildOperationContext(schema, query));

    expect(queryPlan).toMatchInlineSnapshot(`
      QueryPlan {
        Fetch(service: "product") {
          {
            product(upc: "") {
              __typename
              ... on Book {
                details {
                  country
                }
              }
              ... on Furniture {
                details {
                  country
                }
              }
            }
          }
        },
      }
    `);
  });

  describe(`experimental compression to downstream services`, () => {
    it(`should generate fragments internally to downstream requests`, () => {
      const query = gql`
        query {
          topReviews {
            body
            author
            product {
              name
              price
              details {
                country
              }
            }
          }
        }
      `;

      const queryPlan = buildQueryPlan(
        buildOperationContext(schema, query, undefined),
        { autoFragmentization: true },
      );

      expect(queryPlan).toMatchInlineSnapshot(`
        QueryPlan {
          Sequence {
            Fetch(service: "reviews") {
              {
                topReviews {
                  ...__QueryPlanFragment_1__
                }
              }
              fragment __QueryPlanFragment_1__ on Review {
                body
                author
                product {
                  ...__QueryPlanFragment_0__
                }
              }
              fragment __QueryPlanFragment_0__ on Product {
                __typename
                ... on Book {
                  __typename
                  isbn
                }
                ... on Furniture {
                  __typename
                  upc
                }
              }
            },
            Parallel {
              Sequence {
                Flatten(path: "topReviews.@.product") {
                  Fetch(service: "books") {
                    {
                      ... on Book {
                        __typename
                        isbn
                      }
                    } =>
                    {
                      ... on Book {
                        __typename
                        isbn
                        title
                        year
                      }
                    }
                  },
                },
                Flatten(path: "topReviews.@.product") {
                  Fetch(service: "product") {
                    {
                      ... on Book {
                        __typename
                        isbn
                        title
                        year
                      }
                    } =>
                    {
                      ... on Book {
                        name
                      }
                    }
                  },
                },
              },
              Flatten(path: "topReviews.@.product") {
                Fetch(service: "product") {
                  {
                    ... on Furniture {
                      __typename
                      upc
                    }
                    ... on Book {
                      __typename
                      isbn
                    }
                  } =>
                  {
                    ... on Furniture {
                      name
                      price
                      details {
                        country
                      }
                    }
                    ... on Book {
                      price
                      details {
                        country
                      }
                    }
                  }
                },
              },
            },
          },
        }
      `);
    });

    it(`shouldn't generate fragments for selection sets of length 2 or less`, () => {
      const query = gql`
        query {
          topReviews {
            body
            author
          }
        }
      `;

      const queryPlan = buildQueryPlan(
        buildOperationContext(schema, query, undefined),
        { autoFragmentization: true },
      );

      expect(queryPlan).toMatchInlineSnapshot(`
        QueryPlan {
          Fetch(service: "reviews") {
            {
              topReviews {
                body
                author
              }
            }
          },
        }
      `);
    });

    it(`should generate fragments for selection sets of length 3 or greater`, () => {
      const query = gql`
        query {
          topReviews {
            id
            body
            author
          }
        }
      `;

      const queryPlan = buildQueryPlan(
        buildOperationContext(schema, query, undefined),
        { autoFragmentization: true },
      );

      expect(queryPlan).toMatchInlineSnapshot(`
        QueryPlan {
          Fetch(service: "reviews") {
            {
              topReviews {
                ...__QueryPlanFragment_0__
              }
            }
            fragment __QueryPlanFragment_0__ on Review {
              id
              body
              author
            }
          },
        }
      `);
    });

    it(`should generate fragments correctly when aliases are used`, () => {
      const query = gql`
        query {
          reviews: topReviews {
            content: body
            author
            product {
              name
              cost: price
              details {
                origin: country
              }
            }
          }
        }
      `;

      const queryPlan = buildQueryPlan(
        buildOperationContext(schema, query, undefined),
        { autoFragmentization: true },
      );

      expect(queryPlan).toMatchInlineSnapshot(`
        QueryPlan {
          Sequence {
            Fetch(service: "reviews") {
              {
                reviews: topReviews {
                  ...__QueryPlanFragment_1__
                }
              }
              fragment __QueryPlanFragment_1__ on Review {
                content: body
                author
                product {
                  ...__QueryPlanFragment_0__
                }
              }
              fragment __QueryPlanFragment_0__ on Product {
                __typename
                ... on Book {
                  __typename
                  isbn
                }
                ... on Furniture {
                  __typename
                  upc
                }
              }
            },
            Parallel {
              Sequence {
                Flatten(path: "reviews.@.product") {
                  Fetch(service: "books") {
                    {
                      ... on Book {
                        __typename
                        isbn
                      }
                    } =>
                    {
                      ... on Book {
                        __typename
                        isbn
                        title
                        year
                      }
                    }
                  },
                },
                Flatten(path: "reviews.@.product") {
                  Fetch(service: "product") {
                    {
                      ... on Book {
                        __typename
                        isbn
                        title
                        year
                      }
                    } =>
                    {
                      ... on Book {
                        name
                      }
                    }
                  },
                },
              },
              Flatten(path: "reviews.@.product") {
                Fetch(service: "product") {
                  {
                    ... on Furniture {
                      __typename
                      upc
                    }
                    ... on Book {
                      __typename
                      isbn
                    }
                  } =>
                  {
                    ... on Furniture {
                      name
                      cost: price
                      details {
                        origin: country
                      }
                    }
                    ... on Book {
                      cost: price
                      details {
                        origin: country
                      }
                    }
                  }
                },
              },
            },
          },
        }
      `);
    });
  });
});
