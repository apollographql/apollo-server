import { GraphQLObjectType } from 'graphql';
import gql from 'graphql-tag';
import { composeServices } from '../compose';
import {
  astSerializer,
  typeSerializer,
  selectionSetSerializer,
} from '../../snapshotSerializers';
import { normalizeTypeDefs } from '../normalize';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(typeSerializer);
expect.addSnapshotSerializer(selectionSetSerializer);

describe('composeServices', () => {
  it('should include types from different services', () => {
    const serviceA = {
      typeDefs: gql`
        type Product {
          sku: String!
          name: String!
        }
      `,
      name: 'serviceA',
    };

    const serviceB = {
      typeDefs: gql`
        type User {
          name: String
          email: String!
        }
      `,
      name: 'serviceB',
    };

    const { schema, errors } = composeServices([serviceA, serviceB]);
    expect(errors).toHaveLength(0);
    expect(schema).toBeDefined();

    expect(schema.getType('User')).toMatchInlineSnapshot(`
                  type User {
                    name: String
                    email: String!
                  }
            `);

    expect(schema.getType('Product')).toMatchInlineSnapshot(`
                  type Product {
                    sku: String!
                    name: String!
                  }
            `);

    const product = schema.getType('Product') as GraphQLObjectType;
    const user = schema.getType('User') as GraphQLObjectType;

    expect(product.federation.serviceName).toEqual('serviceA');
    expect(user.federation.serviceName).toEqual('serviceB');
  });

  describe('basic type extensions', () => {
    it('works when extension service is second', () => {
      const serviceA = {
        typeDefs: gql`
          type Product {
            sku: String!
            name: String!
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          extend type Product {
            price: Int!
          }
        `,
        name: 'serviceB',
      };

      const { schema, errors } = composeServices([serviceA, serviceB]);
      expect(errors).toHaveLength(0);
      expect(schema).toBeDefined();

      expect(schema.getType('Product')).toMatchInlineSnapshot(`
                        type Product {
                          sku: String!
                          name: String!
                          price: Int!
                        }
                  `);

      const product = schema.getType('Product') as GraphQLObjectType;

      expect(product.federation.serviceName).toEqual('serviceA');
      expect(product.getFields()['price'].federation.serviceName).toEqual(
        'serviceB',
      );
    });

    it('works when extension service is first', () => {
      const serviceA = {
        typeDefs: gql`
          extend type Product {
            price: Int!
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          type Product {
            sku: String!
            name: String!
          }
        `,
        name: 'serviceB',
      };
      const { schema, errors } = composeServices([serviceA, serviceB]);
      expect(errors).toHaveLength(0);
      expect(schema).toBeDefined();

      expect(schema.getType('Product')).toMatchInlineSnapshot(`
                        type Product {
                          sku: String!
                          name: String!
                          price: Int!
                        }
                  `);

      const product = schema.getType('Product') as GraphQLObjectType;

      expect(product.federation.serviceName).toEqual('serviceB');
      expect(product.getFields()['price'].federation.serviceName).toEqual(
        'serviceA',
      );
    });

    it('works with multiple extensions on the same type', () => {
      const serviceA = {
        typeDefs: gql`
          extend type Product {
            price: Int!
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          type Product {
            sku: String!
            name: String!
          }
        `,
        name: 'serviceB',
      };

      const serviceC = {
        typeDefs: gql`
          extend type Product {
            color: String!
          }
        `,
        name: 'serviceC',
      };

      const { schema, errors } = composeServices([
        serviceA,
        serviceB,
        serviceC,
      ]);
      expect(errors).toHaveLength(0);
      expect(schema).toBeDefined();

      expect(schema.getType('Product')).toMatchInlineSnapshot(`
                        type Product {
                          sku: String!
                          name: String!
                          price: Int!
                          color: String!
                        }
                  `);

      const product = schema.getType('Product') as GraphQLObjectType;

      expect(product.federation.serviceName).toEqual('serviceB');
      expect(product.getFields()['price'].federation.serviceName).toEqual(
        'serviceA',
      );
      expect(product.getFields()['color'].federation.serviceName).toEqual(
        'serviceC',
      );
    });

    it('allows extensions to overwrite other extension fields', () => {
      const serviceA = {
        typeDefs: gql`
          extend type Product {
            price: Int!
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          type Product {
            sku: String!
            name: String!
          }
        `,
        name: 'serviceB',
      };

      const serviceC = {
        typeDefs: gql`
          extend type Product {
            price: Float!
            color: String!
          }
        `,
        name: 'serviceC',
      };

      const { schema, errors } = composeServices([
        serviceA,
        serviceB,
        serviceC,
      ]);
      expect(errors).toMatchInlineSnapshot(`
                        Array [
                          [GraphQLError: Field "Product.price" can only be defined once.],
                        ]
                  `);
      expect(schema).toBeDefined();

      const product = schema.getType('Product') as GraphQLObjectType;
      expect(product).toMatchInlineSnapshot(`
                        type Product {
                          sku: String!
                          name: String!
                          price: Float!
                          color: String!
                        }
                  `);

      expect(product.federation.serviceName).toEqual('serviceB');
      expect(product.getFields()['price'].federation.serviceName).toEqual(
        'serviceC',
      );
    });

    it('preserves arguments for fields', () => {
      const serviceA = {
        typeDefs: gql`
          enum Curr {
            USD
            GBP
          }

          extend type Product {
            price(currency: Curr!): Int!
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          type Product {
            sku: String!
            name(type: String): String!
          }
        `,
        name: 'serviceB',
      };
      const { schema, errors } = composeServices([serviceA, serviceB]);
      expect(errors).toHaveLength(0);
      expect(schema).toBeDefined();

      expect(schema.getType('Product')).toMatchInlineSnapshot(`
                        type Product {
                          sku: String!
                          name(type: String): String!
                          price(currency: Curr!): Int!
                        }
                  `);

      const product = schema.getType('Product') as GraphQLObjectType;
      expect(product.getFields()['price'].args[0].name).toEqual('currency');
    });

    // This is a limitation of extendSchema currently (this is currently a broken test to demonstrate)
    it.skip('overwrites field on extension by base type when base type comes second', () => {
      const serviceA = {
        typeDefs: gql`
          extend type Product {
            sku: String!
            name: String!
          }
        `,
        name: 'serviceA',
      };
      const serviceB = {
        typeDefs: gql`
          type Product {
            sku: String!
            name: String!
          }
        `,
        name: 'serviceB',
      };

      const { schema, errors } = composeServices([serviceA, serviceB]);
      expect(schema).toBeDefined();
      expect(errors).toMatchInlineSnapshot(`
                        Array [
                          [GraphQLError: Field "Product.sku" already exists in the schema. It cannot also be defined in this type extension.],
                          [GraphQLError: Field "Product.name" already exists in the schema. It cannot also be defined in this type extension.],
                        ]
                  `);

      const product = schema.getType('Product') as GraphQLObjectType;

      expect(product).toMatchInlineSnapshot(`
                        type Product {
                          sku: String!
                          name: String!
                        }
                  `);
      expect(product.getFields()['sku'].federation.serviceName).toEqual(
        'serviceB',
      );
      expect(product.getFields()['name'].federation.serviceName).toEqual(
        'serviceB',
      );
    });

    describe('collisions & error handling', () => {
      it('handles collisions on type extensions as expected', () => {
        const serviceA = {
          typeDefs: gql`
            type Product {
              sku: String!
              name: String!
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            extend type Product {
              name: String!
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(schema).toBeDefined();
        expect(errors).toMatchInlineSnapshot(`
          Array [
            [GraphQLError: [serviceA] Product.name -> Field "Product.name" already exists in the schema. It cannot also be defined in this type extension. If this is meant to be an external field, add the \`@external\` directive.],
          ]
        `);

        const product = schema.getType('Product') as GraphQLObjectType;

        expect(product).toMatchInlineSnapshot(`
                              type Product {
                                sku: String!
                                name: String!
                              }
                        `);
        expect(product.getFields()['name'].federation.serviceName).toEqual(
          'serviceB',
        );
      });

      it('reports multiple errors correctly', () => {
        const serviceA = {
          typeDefs: gql`
            type Query {
              product: Product
            }

            type Product {
              sku: String!
              name: String!
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            extend type Product {
              sku: String!
              name: String!
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(schema).toBeDefined();
        expect(errors).toMatchInlineSnapshot(`
          Array [
            [GraphQLError: [serviceA] Product.sku -> Field "Product.sku" already exists in the schema. It cannot also be defined in this type extension. If this is meant to be an external field, add the \`@external\` directive.],
            [GraphQLError: [serviceA] Product.name -> Field "Product.name" already exists in the schema. It cannot also be defined in this type extension. If this is meant to be an external field, add the \`@external\` directive.],
          ]
        `);

        const product = schema.getType('Product') as GraphQLObjectType;

        expect(product).toMatchInlineSnapshot(`
                              type Product {
                                sku: String!
                                name: String!
                              }
                        `);
        expect(product.getFields()['name'].federation.serviceName).toEqual(
          'serviceB',
        );
      });

      it('handles collisions of base types as expected (newest takes precedence)', () => {
        const serviceA = {
          typeDefs: gql`
            type Product {
              sku: String!
              name: String!
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            type Product {
              id: ID!
              name: String!
              price: Int!
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(schema).toBeDefined();
        expect(errors).toMatchInlineSnapshot(`
                    Array [
                      [GraphQLError: Field "Product.name" can only be defined once.],
                      [GraphQLError: There can be only one type named "Product".],
                    ]
                `);

        const product = schema.getType('Product') as GraphQLObjectType;

        expect(product).toMatchInlineSnapshot(`
                              type Product {
                                id: ID!
                                name: String!
                                price: Int!
                              }
                        `);
      });
    });
  });

  // Maybe just test conflicts in types
  // it("interfaces, unions", () => {});

  // TODO: _allow_ enum and input extensions, but don't add serviceName
  describe('input and enum type extensions', () => {
    it('extends input types', () => {
      const serviceA = {
        typeDefs: gql`
          input ProductInput {
            sku: String!
            name: String!
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          extend input ProductInput {
            color: String!
          }
        `,
        name: 'serviceB',
      };

      const { schema, errors } = composeServices([serviceA, serviceB]);
      expect(schema).toBeDefined();
      expect(errors).toMatchInlineSnapshot(`Array []`);
    });

    it('extends enum types', () => {
      const serviceA = {
        typeDefs: gql`
          enum ProductCategory {
            BED
            BATH
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          extend enum ProductCategory {
            BEYOND
          }
        `,
        name: 'serviceB',
      };

      const { schema, errors } = composeServices([serviceA, serviceB]);
      expect(schema).toBeDefined();
      expect(errors).toMatchInlineSnapshot(`Array []`);
    });
  });

  describe('interfaces', () => {
    // TODO: should there be a validation warning of some sort for this?
    it('allows overwriting a type that implements an interface improperly', () => {
      const serviceA = {
        typeDefs: gql`
          interface Item {
            id: ID!
          }

          type Product implements Item {
            id: ID!
            sku: String!
            name: String!
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          extend type Product {
            id: String!
          }
        `,
        name: 'serviceB',
      };

      const { schema, errors } = composeServices([serviceA, serviceB]);
      expect(errors).toMatchInlineSnapshot(`
        Array [
          [GraphQLError: [serviceA] Product.id -> Field "Product.id" already exists in the schema. It cannot also be defined in this type extension. If this is meant to be an external field, add the \`@external\` directive.],
        ]
      `);
      expect(schema).toBeDefined();

      expect(schema.getType('Product')).toMatchInlineSnapshot(`
                        type Product implements Item {
                          id: String!
                          sku: String!
                          name: String!
                        }
                  `);

      const product = schema.getType('Product') as GraphQLObjectType;

      expect(product.federation.serviceName).toEqual('serviceA');
      expect(product.getFields()['id'].federation.serviceName).toEqual(
        'serviceB',
      );
    });
  });

  describe('root type extensions', () => {
    it('allows extension of the Query type with no base type definition', () => {
      const serviceA = {
        typeDefs: gql`
          extend type Query {
            products: [ID!]
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          extend type Query {
            people: [ID!]
          }
        `,
        name: 'serviceB',
      };

      const { schema, errors } = composeServices([serviceA, serviceB]);
      expect(errors).toHaveLength(0);
      expect(schema).toBeDefined();

      expect(schema.getQueryType()).toMatchInlineSnapshot(`
                        type Query {
                          products: [ID!]
                          people: [ID!]
                        }
                  `);

      const query = schema.getQueryType();

      expect(query.federation.serviceName).toBeUndefined();
    });

    it('treats root Query type definition as an extension, not base definitions', () => {
      const serviceA = {
        typeDefs: gql`
          type Query {
            products: [ID!]
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          extend type Query {
            people: [ID!]
          }
        `,
        name: 'serviceB',
      };

      const normalizedServices = [serviceA, serviceB].map(
        ({ name, typeDefs }) => ({
          name,
          typeDefs: normalizeTypeDefs(typeDefs),
        }),
      );
      const { schema, errors } = composeServices(normalizedServices);
      expect(errors).toHaveLength(0);
      expect(schema).toBeDefined();

      expect(schema.getType('Query')).toMatchInlineSnapshot(`
                        type Query {
                          products: [ID!]
                          people: [ID!]
                        }
                  `);

      const query = schema.getType('Query') as GraphQLObjectType;

      expect(query.federation.serviceName).toBeUndefined();
    });

    it('allows extension of the Mutation type with no base type definition', () => {
      const serviceA = {
        typeDefs: gql`
          extend type Mutation {
            login(credentials: Credentials!): String
          }

          input Credentials {
            username: String!
            password: String!
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          extend type Mutation {
            logout(username: String!): Boolean
          }
        `,
        name: 'serviceB',
      };

      const { schema, errors } = composeServices([serviceA, serviceB]);
      expect(errors).toHaveLength(0);
      expect(schema).toBeDefined();

      expect(schema.getType('Mutation')).toMatchInlineSnapshot(`
                        type Mutation {
                          login(credentials: Credentials!): String
                          logout(username: String!): Boolean
                        }
                  `);
    });

    it('treats root Mutations type definition as an extension, not base definitions', () => {
      const serviceA = {
        typeDefs: gql`
          type Mutation {
            login(credentials: Credentials!): String
          }

          input Credentials {
            username: String!
            password: String!
          }
        `,
        name: 'serviceA',
      };

      const serviceB = {
        typeDefs: gql`
          extend type Mutation {
            logout(username: String!): Boolean
          }
        `,
        name: 'serviceB',
      };

      const { schema, errors } = composeServices([serviceA, serviceB]);
      expect(errors).toHaveLength(0);
      expect(schema).toBeDefined();

      expect(schema.getType('Mutation')).toMatchInlineSnapshot(`
                        type Mutation {
                          login(credentials: Credentials!): String
                          logout(username: String!): Boolean
                        }
                  `);
    });

    // TODO: not sure what to do here. Haven't looked into it yet :)
    it.skip('works with custom root types', () => {});
  });

  describe('federation directives', () => {
    // Directives - allow schema (federation) directives
    describe('@external', () => {
      it('adds externals map from service to externals for @external fields', () => {
        const serviceA = {
          typeDefs: gql`
            type Product @key(fields: "color { id value }") {
              sku: String!
              upc: String!
              color: Color!
            }

            type Color {
              id: ID!
              value: String!
            }
          `,
          name: 'serviceA--FOUND',
        };

        const serviceB = {
          typeDefs: gql`
            extend type Product {
              sku: String! @external
              price: Int! @requires(fields: "sku")
            }
          `,
          name: 'serviceB--MISSING',
        };

        const serviceC = {
          typeDefs: gql`
            extend type Product {
              sku: String! @external
              upc: String! @external
              weight: Int! @requires(fields: "sku upc")
            }
          `,
          name: 'serviceC--found',
        };

        const { schema, errors } = composeServices([
          serviceA,
          serviceC,
          serviceB,
        ]);

        expect(errors).toHaveLength(0);

        const product = schema.getType('Product');

        expect(product.federation.externals).toMatchInlineSnapshot(`
                              Object {
                                "serviceB--MISSING": Array [
                                  Object {
                                    "field": sku: String! @external,
                                    "parentTypeName": "Product",
                                    "serviceName": "serviceB--MISSING",
                                  },
                                ],
                                "serviceC--found": Array [
                                  Object {
                                    "field": sku: String! @external,
                                    "parentTypeName": "Product",
                                    "serviceName": "serviceC--found",
                                  },
                                  Object {
                                    "field": upc: String! @external,
                                    "parentTypeName": "Product",
                                    "serviceName": "serviceC--found",
                                  },
                                ],
                              }
                        `);
      });
      it('does not redefine fields with @external when composing', () => {
        const serviceA = {
          typeDefs: gql`
            type Product @key(fields: "sku") {
              sku: String!
              name: String!
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            extend type Product {
              sku: String! @external
              price: Int! @requires(fields: "sku")
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(schema).toBeDefined();
        expect(errors).toHaveLength(0);

        const product = schema.getType('Product') as GraphQLObjectType;

        expect(product).toMatchInlineSnapshot(`
                              type Product {
                                sku: String!
                                name: String!
                                price: Int!
                              }
                        `);
        expect(product.getFields()['price'].federation.serviceName).toEqual(
          'serviceB',
        );
        expect(product.federation.serviceName).toEqual('serviceA');
      });
    });

    describe('@requires directive', () => {
      it('adds @requires information to fields using a simple field set', () => {
        const serviceA = {
          typeDefs: gql`
            type Product @key(fields: "sku") {
              sku: String!
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            extend type Product {
              sku: String! @external
              price: Int! @requires(fields: "sku")
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(errors).toHaveLength(0);

        const product = schema.getType('Product') as GraphQLObjectType;
        expect(
          product.getFields()['price'].federation.requires,
        ).toMatchInlineSnapshot(`sku`);
      });

      it('adds @requires information to fields using a nested field set', () => {
        const serviceA = {
          typeDefs: gql`
            type Product @key(fields: "sku { id }") {
              sku: Sku!
            }

            type Sku {
              id: ID!
              value: String!
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            extend type Product {
              sku: Sku! @external
              price: Float! @requires(fields: "sku { id }")
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(errors).toHaveLength(0);

        const product = schema.getType('Product') as GraphQLObjectType;
        expect(product.getFields()['price'].federation.requires)
          .toMatchInlineSnapshot(`
                                sku {
                                  id
                                }
                          `);
      });
    });

    // TODO: provides can happen on an extended type as well, add a test case for this
    describe('@provides directive', () => {
      it('adds @provides information to fields using a simple field set', () => {
        const serviceA = {
          typeDefs: gql`
            type Review {
              product: Product @provides(fields: "sku")
            }

            extend type Product {
              sku: String @external
              color: String
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            type Product @key(fields: "sku") {
              sku: String!
              price: Int! @requires(fields: "sku")
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(errors).toHaveLength(0);

        const review = schema.getType('Review') as GraphQLObjectType;
        expect(review.getFields()['product'].federation).toMatchInlineSnapshot(`
          Object {
            "belongsToValueType": false,
            "provides": sku,
            "serviceName": "serviceA",
          }
        `);
      });

      it('adds @provides information to fields using a nested field set', () => {
        const serviceA = {
          typeDefs: gql`
            type Review {
              product: Product @provides(fields: "sku { id }")
            }

            extend type Product {
              sku: Sku @external
              color: String
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            type Product @key(fields: "sku { id }") {
              sku: Sku!
              price: Int! @requires(fields: "sku")
            }

            type Sku {
              id: ID!
              value: String!
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(errors).toHaveLength(0);

        const review = schema.getType('Review') as GraphQLObjectType;
        expect(review.getFields()['product'].federation.provides)
          .toMatchInlineSnapshot(`
                                sku {
                                  id
                                }
                          `);
      });

      it('adds @provides information for object types within list types', () => {
        const serviceA = {
          typeDefs: gql`
            type Review {
              products: [Product] @provides(fields: "sku")
            }

            extend type Product {
              sku: String @external
              color: String
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            type Product @key(fields: "sku") {
              sku: String!
              price: Int! @requires(fields: "sku")
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(errors).toHaveLength(0);

        const review = schema.getType('Review') as GraphQLObjectType;
        expect(review.getFields()['products'].federation)
          .toMatchInlineSnapshot(`
          Object {
            "belongsToValueType": false,
            "provides": sku,
            "serviceName": "serviceA",
          }
        `);
      });

      it('adds correct @provides information to fields on value types', () => {
        const serviceA = {
          typeDefs: gql`
            extend type Query {
              valueType: ValueType
            }

            type ValueType {
              id: ID!
              user: User! @provides(fields: "id name")
            }

            type User @key(fields: "id") {
              id: ID!
              name: String!
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            type ValueType {
              id: ID!
              user: User! @provides(fields: "id name")
            }

            extend type User @key(fields: "id") {
              id: ID! @external
              name: String! @external
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(errors).toHaveLength(0);

        const valueType = schema.getType('ValueType') as GraphQLObjectType;
        const userField = valueType.getFields()['user'].federation;
        expect(userField.belongsToValueType).toBe(true);
        expect(userField.serviceName).toBe(null);
      });
    });

    describe('@key directive', () => {
      it('adds @key information to types using basic string notation', () => {
        const serviceA = {
          typeDefs: gql`
            type Product @key(fields: "sku") @key(fields: "upc") {
              sku: String!
              upc: String!
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            extend type Product {
              sku: String! @external
              price: Int! @requires(fields: "sku")
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(errors).toHaveLength(0);

        const product = schema.getType('Product') as GraphQLObjectType;
        expect(product.federation.keys).toMatchInlineSnapshot(`
                              Object {
                                "serviceA": Array [
                                  sku,
                                  upc,
                                ],
                              }
                        `);
      });

      it('adds @key information to types using selection set notation', () => {
        const serviceA = {
          typeDefs: gql`
            type Product @key(fields: "color { id value }") {
              sku: String!
              upc: String!
              color: Color!
            }

            type Color {
              id: ID!
              value: String!
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            extend type Product {
              sku: String! @external
              price: Int! @requires(fields: "sku")
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(errors).toHaveLength(0);

        const product = schema.getType('Product') as GraphQLObjectType;
        expect(product.federation.keys).toMatchInlineSnapshot(`
                              Object {
                                "serviceA": Array [
                                  color {
                                id
                                value
                              },
                                ],
                              }
                        `);
      });

      it('preserves @key information with respect to types across different services', () => {
        const serviceA = {
          typeDefs: gql`
            type Product @key(fields: "color { id value }") {
              sku: String!
              upc: String!
              color: Color!
            }

            type Color {
              id: ID!
              value: String!
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            extend type Product @key(fields: "sku") {
              sku: String! @external
              price: Int! @requires(fields: "sku")
            }
          `,
          name: 'serviceB',
        };

        const { schema, errors } = composeServices([serviceA, serviceB]);
        expect(errors).toHaveLength(0);

        const product = schema.getType('Product') as GraphQLObjectType;
        expect(product.federation.keys).toMatchInlineSnapshot(`
                              Object {
                                "serviceA": Array [
                                  color {
                                id
                                value
                              },
                                ],
                                "serviceB": Array [
                                  sku,
                                ],
                              }
                        `);
      });
    });

    describe('@extends directive', () => {
      it('treats types with @extends as type extensions', () => {
        const serviceA = {
          typeDefs: gql`
            type Product @key(fields: "sku") {
              sku: String!
              upc: String!
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            type Product @extends @key(fields: "sku") {
              sku: String! @external
              price: Int! @requires(fields: "sku")
            }
          `,
          name: 'serviceB',
        };

        const normalizedServices = [serviceA, serviceB].map(
          ({ name, typeDefs }) => ({
            name,
            typeDefs: normalizeTypeDefs(typeDefs),
          }),
        );
        const { schema, errors } = composeServices(normalizedServices);

        expect(errors).toHaveLength(0);

        const product = schema.getType('Product') as GraphQLObjectType;
        expect(product).toMatchInlineSnapshot(`
                              type Product {
                                sku: String!
                                upc: String!
                                price: Int!
                              }
                        `);
      });

      it('treats interfaces with @extends as interface extensions', () => {
        const serviceA = {
          typeDefs: gql`
            interface Product @key(fields: "sku") {
              sku: String!
              upc: String!
            }
          `,
          name: 'serviceA',
        };

        const serviceB = {
          typeDefs: gql`
            interface Product @extends @key(fields: "sku") {
              sku: String! @external
              price: Int! @requires(fields: "sku")
            }
          `,
          name: 'serviceB',
        };

        const normalizedServices = [serviceA, serviceB].map(
          ({ name, typeDefs }) => ({
            name,
            typeDefs: normalizeTypeDefs(typeDefs),
          }),
        );
        const { schema, errors } = composeServices(normalizedServices);

        expect(errors).toHaveLength(0);

        const product = schema.getType('Product') as GraphQLObjectType;
        expect(product).toMatchInlineSnapshot(`
          interface Product {
            sku: String!
            upc: String!
            price: Int!
          }
        `);
      });
    });
  });
});

// XXX Ignored/unimplemented spec tests
// it("allows extension of custom scalars", () => {});
