import { GraphQLSchema, GraphQLError, getIntrospectionQuery } from 'graphql';
import path from 'path';
import {
  GraphQLSchemaValidationError,
  GraphQLSchemaModule,
  addResolversToSchema,
  GraphQLResolverMap,
} from 'apollo-graphql';
import gql from 'graphql-tag';
import { GraphQLRequestContext } from 'apollo-server-core';
import { composeServices, buildFederatedSchema } from '@apollo/federation';

import { buildQueryPlan, buildOperationContext } from '../buildQueryPlan';
import { executeQueryPlan } from '../executeQueryPlan';
import { LocalGraphQLDataSource } from '../datasources/LocalGraphQLDatasource';

function buildLocalService(modules: GraphQLSchemaModule[]) {
  const schema = buildFederatedSchema(modules);
  return new LocalGraphQLDataSource(schema);
}

describe('executeQueryPlan', () => {
  let serviceMap: {
    [serviceName: string]: LocalGraphQLDataSource;
  };

  function overrideResolversInService(
    serviceName: string,
    resolvers: GraphQLResolverMap,
  ) {
    addResolversToSchema(serviceMap[serviceName].schema, resolvers);
  }

  let schema: GraphQLSchema;

  beforeEach(() => {
    serviceMap = Object.fromEntries(
      ['accounts', 'product', 'inventory', 'reviews'].map(serviceName => {
        return [
          serviceName,
          buildLocalService([
            require(path.join(__dirname, '__fixtures__/schemas', serviceName)),
          ]),
        ] as [string, LocalGraphQLDataSource];
      }),
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

  function buildRequestContext(): GraphQLRequestContext {
    return {
      cache: undefined as any,
      context: {},
      request: {
        variables: {},
      },
    };
  }

  describe(`errors`, () => {
    it(`should not include an empty "errors" array when no errors were encountered`, async () => {
      const query = gql`
        query {
          me {
            name
          }
        }
      `;

      const operationContext = buildOperationContext(schema, query);
      const queryPlan = buildQueryPlan(operationContext);

      const response = await executeQueryPlan(
        queryPlan,
        serviceMap,
        buildRequestContext(),
        operationContext,
      );

      expect(response).not.toHaveProperty('errors');
    });

    it(`should include an error when a root-level field errors out`, async () => {
      overrideResolversInService('accounts', {
        Query: {
          me() {
            throw new Error('Something went wrong');
          },
        },
      });

      const query = gql`
        query {
          me {
            name
          }
        }
      `;

      const operationContext = buildOperationContext(schema, query);
      const queryPlan = buildQueryPlan(operationContext);

      const response = await executeQueryPlan(
        queryPlan,
        serviceMap,
        buildRequestContext(),
        operationContext,
      );

      expect(response).toHaveProperty('data.me', null);
      expect(response).toHaveProperty(
        'errors.0.extensions.downstreamErrors.0.message',
        'Something went wrong',
      );
    });

    it(`should still include other root-level results if one root-level field errors out`, async () => {
      overrideResolversInService('accounts', {
        Query: {
          me() {
            throw new Error('Something went wrong');
          },
        },
      });

      const query = gql`
        query {
          me {
            name
          }
          topReviews {
            body
          }
        }
      `;

      const operationContext = buildOperationContext(schema, query);
      const queryPlan = buildQueryPlan(operationContext);

      const response = await executeQueryPlan(
        queryPlan,
        serviceMap,
        buildRequestContext(),
        operationContext,
      );

      expect(response).toHaveProperty('data.me', null);
      expect(response).toHaveProperty('data.topReviews', expect.any(Array));
    });

    it(`should still include data from other services if one services is unavailable`, async () => {
      delete serviceMap.accounts;

      const query = gql`
        query {
          me {
            name
          }
          topReviews {
            body
          }
        }
      `;

      const operationContext = buildOperationContext(schema, query);
      const queryPlan = buildQueryPlan(operationContext);

      const response = await executeQueryPlan(
        queryPlan,
        serviceMap,
        buildRequestContext(),
        operationContext,
      );

      expect(response).toHaveProperty('data.me', null);
      expect(response).toHaveProperty('data.topReviews', expect.any(Array));
    });
  });

  it(`should only return fields that have been requested directly`, async () => {
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

    const operationContext = buildOperationContext(schema, query);
    const queryPlan = buildQueryPlan(operationContext);

    const response = await executeQueryPlan(
      queryPlan,
      serviceMap,
      buildRequestContext(),
      operationContext,
    );

    expect(response.data).toMatchInlineSnapshot(`
                  Object {
                    "topReviews": Array [
                      Object {
                        "author": Object {
                          "name": "Ada Lovelace",
                        },
                        "body": "Love it!",
                      },
                      Object {
                        "author": Object {
                          "name": "Ada Lovelace",
                        },
                        "body": "Too expensive.",
                      },
                      Object {
                        "author": Object {
                          "name": "Alan Turing",
                        },
                        "body": "Could be better.",
                      },
                      Object {
                        "author": Object {
                          "name": "Alan Turing",
                        },
                        "body": "Prefer something else.",
                      },
                      Object {
                        "author": Object {
                          "name": "Alan Turing",
                        },
                        "body": "Wish I had read this before.",
                      },
                    ],
                  }
            `);
  });

  it('should not duplicate variable definitions', async () => {
    const query = gql`
      query Test($first: Int!) {
        first: topReviews(first: $first) {
          body
          author {
            name
          }
        }
        second: topReviews(first: $first) {
          body
          author {
            name
          }
        }
      }
    `;

    const operationContext = buildOperationContext(schema, query);
    const queryPlan = buildQueryPlan(operationContext);

    const requestContext = buildRequestContext();
    requestContext.request.variables = { first: 3 };

    const response = await executeQueryPlan(
      queryPlan,
      serviceMap,
      requestContext,
      operationContext,
    );

    expect(response.data).toMatchInlineSnapshot(`
      Object {
        "first": Array [
          Object {
            "author": Object {
              "name": "Ada Lovelace",
            },
            "body": "Love it!",
          },
          Object {
            "author": Object {
              "name": "Ada Lovelace",
            },
            "body": "Too expensive.",
          },
          Object {
            "author": Object {
              "name": "Alan Turing",
            },
            "body": "Could be better.",
          },
        ],
        "second": Array [
          Object {
            "author": Object {
              "name": "Ada Lovelace",
            },
            "body": "Love it!",
          },
          Object {
            "author": Object {
              "name": "Ada Lovelace",
            },
            "body": "Too expensive.",
          },
          Object {
            "author": Object {
              "name": "Alan Turing",
            },
            "body": "Could be better.",
          },
        ],
      }
    `);
  });

  it('can execute an introspection query', async () => {
    const operationContext = buildOperationContext(
      schema,
      gql`
        ${getIntrospectionQuery()}
      `,
    );
    const queryPlan = buildQueryPlan(operationContext);

    const response = await executeQueryPlan(
      queryPlan,
      serviceMap,
      buildRequestContext(),
      operationContext,
    );

    expect(response.data).toHaveProperty('__schema');
    expect(response.errors).toBeUndefined();
  });
});
