import { GraphQLSchema, GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import { buildQueryPlan, buildOperationContext } from '../buildQueryPlan';
import { astSerializer, queryPlanSerializer } from '../snapshotSerializers';
import { getFederatedTestingSchema } from './execution-utils';

// expect.addSnapshotSerializer(astSerializer);
// expect.addSnapshotSerializer(queryPlanSerializer);

describe('buildQueryPlan', () => {
  let schema: GraphQLSchema;
  let errors: GraphQLError[];

  beforeEach(() => {
    ({ schema, errors } = getFederatedTestingSchema());
    expect(errors).toHaveLength(0);
  });

  it(`should not confuse union types with overlapping field names`, () => {
    const query = gql`
      query {
        body {
          ... on Image {
            attributes {
              url
            }
          }
          ... on Text {
            attributes {
              bold
              text
            }
          }
        }
      }
    `;

    const queryPlan = buildQueryPlan(
      buildOperationContext(schema, query, undefined),
    );

    expect(queryPlan).toMatchInlineSnapshot(`
      Object {
        "kind": "QueryPlan",
        "node": Object {
          "kind": "Fetch",
          "operation": "{body{__typename ...on Image{attributes{url}}...on Text{attributes{bold text}}}}",
          "requires": undefined,
          "serviceName": "documents",
          "variableUsages": Array [],
        },
      }
    `);
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
      Object {
        "kind": "QueryPlan",
        "node": Object {
          "kind": "Fetch",
          "operation": "{me{name}}",
          "requires": undefined,
          "serviceName": "accounts",
          "variableUsages": Array [],
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
      Object {
        "kind": "QueryPlan",
        "node": Object {
          "kind": "Parallel",
          "nodes": Array [
            Object {
              "kind": "Fetch",
              "operation": "{me{name}}",
              "requires": undefined,
              "serviceName": "accounts",
              "variableUsages": Array [],
            },
            Object {
              "kind": "Sequence",
              "nodes": Array [
                Object {
                  "kind": "Fetch",
                  "operation": "{topProducts{__typename ...on Book{__typename isbn}...on Furniture{name}}}",
                  "requires": undefined,
                  "serviceName": "product",
                  "variableUsages": Array [],
                },
                Object {
                  "kind": "Flatten",
                  "node": Object {
                    "kind": "Fetch",
                    "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{__typename isbn title year}}}",
                    "requires": Array [
                      Object {
                        "kind": "InlineFragment",
                        "selections": Array [
                          Object {
                            "kind": "Field",
                            "name": "__typename",
                            "selections": undefined,
                          },
                          Object {
                            "kind": "Field",
                            "name": "isbn",
                            "selections": undefined,
                          },
                        ],
                        "typeCondition": "Book",
                      },
                    ],
                    "serviceName": "books",
                    "variableUsages": Array [],
                  },
                  "path": Array [
                    "topProducts",
                    "@",
                  ],
                },
                Object {
                  "kind": "Flatten",
                  "node": Object {
                    "kind": "Fetch",
                    "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{name}}}",
                    "requires": Array [
                      Object {
                        "kind": "InlineFragment",
                        "selections": Array [
                          Object {
                            "kind": "Field",
                            "name": "__typename",
                            "selections": undefined,
                          },
                          Object {
                            "kind": "Field",
                            "name": "isbn",
                            "selections": undefined,
                          },
                          Object {
                            "kind": "Field",
                            "name": "title",
                            "selections": undefined,
                          },
                          Object {
                            "kind": "Field",
                            "name": "year",
                            "selections": undefined,
                          },
                        ],
                        "typeCondition": "Book",
                      },
                    ],
                    "serviceName": "product",
                    "variableUsages": Array [],
                  },
                  "path": Array [
                    "topProducts",
                    "@",
                  ],
                },
              ],
            },
          ],
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
      Object {
        "kind": "QueryPlan",
        "node": Object {
          "kind": "Sequence",
          "nodes": Array [
            Object {
              "kind": "Fetch",
              "operation": "{topProducts{__typename ...on Book{__typename isbn}...on Furniture{name}}product(upc:\\"1\\"){__typename ...on Book{__typename isbn}...on Furniture{name}}}",
              "requires": undefined,
              "serviceName": "product",
              "variableUsages": Array [],
            },
            Object {
              "kind": "Parallel",
              "nodes": Array [
                Object {
                  "kind": "Sequence",
                  "nodes": Array [
                    Object {
                      "kind": "Flatten",
                      "node": Object {
                        "kind": "Fetch",
                        "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{__typename isbn title year}}}",
                        "requires": Array [
                          Object {
                            "kind": "InlineFragment",
                            "selections": Array [
                              Object {
                                "kind": "Field",
                                "name": "__typename",
                                "selections": undefined,
                              },
                              Object {
                                "kind": "Field",
                                "name": "isbn",
                                "selections": undefined,
                              },
                            ],
                            "typeCondition": "Book",
                          },
                        ],
                        "serviceName": "books",
                        "variableUsages": Array [],
                      },
                      "path": Array [
                        "topProducts",
                        "@",
                      ],
                    },
                    Object {
                      "kind": "Flatten",
                      "node": Object {
                        "kind": "Fetch",
                        "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{name}}}",
                        "requires": Array [
                          Object {
                            "kind": "InlineFragment",
                            "selections": Array [
                              Object {
                                "kind": "Field",
                                "name": "__typename",
                                "selections": undefined,
                              },
                              Object {
                                "kind": "Field",
                                "name": "isbn",
                                "selections": undefined,
                              },
                              Object {
                                "kind": "Field",
                                "name": "title",
                                "selections": undefined,
                              },
                              Object {
                                "kind": "Field",
                                "name": "year",
                                "selections": undefined,
                              },
                            ],
                            "typeCondition": "Book",
                          },
                        ],
                        "serviceName": "product",
                        "variableUsages": Array [],
                      },
                      "path": Array [
                        "topProducts",
                        "@",
                      ],
                    },
                  ],
                },
                Object {
                  "kind": "Sequence",
                  "nodes": Array [
                    Object {
                      "kind": "Flatten",
                      "node": Object {
                        "kind": "Fetch",
                        "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{__typename isbn title year}}}",
                        "requires": Array [
                          Object {
                            "kind": "InlineFragment",
                            "selections": Array [
                              Object {
                                "kind": "Field",
                                "name": "__typename",
                                "selections": undefined,
                              },
                              Object {
                                "kind": "Field",
                                "name": "isbn",
                                "selections": undefined,
                              },
                            ],
                            "typeCondition": "Book",
                          },
                        ],
                        "serviceName": "books",
                        "variableUsages": Array [],
                      },
                      "path": Array [
                        "product",
                      ],
                    },
                    Object {
                      "kind": "Flatten",
                      "node": Object {
                        "kind": "Fetch",
                        "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{name}}}",
                        "requires": Array [
                          Object {
                            "kind": "InlineFragment",
                            "selections": Array [
                              Object {
                                "kind": "Field",
                                "name": "__typename",
                                "selections": undefined,
                              },
                              Object {
                                "kind": "Field",
                                "name": "isbn",
                                "selections": undefined,
                              },
                              Object {
                                "kind": "Field",
                                "name": "title",
                                "selections": undefined,
                              },
                              Object {
                                "kind": "Field",
                                "name": "year",
                                "selections": undefined,
                              },
                            ],
                            "typeCondition": "Book",
                          },
                        ],
                        "serviceName": "product",
                        "variableUsages": Array [],
                      },
                      "path": Array [
                        "product",
                      ],
                    },
                  ],
                },
              ],
            },
          ],
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
      Object {
        "kind": "QueryPlan",
        "node": Object {
          "kind": "Fetch",
          "operation": "{topReviews{body author{reviews{body}}}}",
          "requires": undefined,
          "serviceName": "reviews",
          "variableUsages": Array [],
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
      Object {
        "kind": "QueryPlan",
        "node": Object {
          "kind": "Fetch",
          "operation": "{topReviews{body author{id reviews{body}}}}",
          "requires": undefined,
          "serviceName": "reviews",
          "variableUsages": Array [],
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
        Object {
          "kind": "QueryPlan",
          "node": Object {
            "kind": "Sequence",
            "nodes": Array [
              Object {
                "kind": "Fetch",
                "operation": "{me{name __typename id}}",
                "requires": undefined,
                "serviceName": "accounts",
                "variableUsages": Array [],
              },
              Object {
                "kind": "Flatten",
                "node": Object {
                  "kind": "Fetch",
                  "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{reviews{body}}}}",
                  "requires": Array [
                    Object {
                      "kind": "InlineFragment",
                      "selections": Array [
                        Object {
                          "kind": "Field",
                          "name": "__typename",
                          "selections": undefined,
                        },
                        Object {
                          "kind": "Field",
                          "name": "id",
                          "selections": undefined,
                        },
                      ],
                      "typeCondition": "User",
                    },
                  ],
                  "serviceName": "reviews",
                  "variableUsages": Array [],
                },
                "path": Array [
                  "me",
                ],
              },
            ],
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
          Object {
            "kind": "QueryPlan",
            "node": Object {
              "kind": "Sequence",
              "nodes": Array [
                Object {
                  "kind": "Fetch",
                  "operation": "{me{__typename id}}",
                  "requires": undefined,
                  "serviceName": "accounts",
                  "variableUsages": Array [],
                },
                Object {
                  "kind": "Flatten",
                  "node": Object {
                    "kind": "Fetch",
                    "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{reviews{body}}}}",
                    "requires": Array [
                      Object {
                        "kind": "InlineFragment",
                        "selections": Array [
                          Object {
                            "kind": "Field",
                            "name": "__typename",
                            "selections": undefined,
                          },
                          Object {
                            "kind": "Field",
                            "name": "id",
                            "selections": undefined,
                          },
                        ],
                        "typeCondition": "User",
                      },
                    ],
                    "serviceName": "reviews",
                    "variableUsages": Array [],
                  },
                  "path": Array [
                    "me",
                  ],
                },
              ],
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
        Object {
          "kind": "QueryPlan",
          "node": Object {
            "kind": "Sequence",
            "nodes": Array [
              Object {
                "kind": "Fetch",
                "operation": "{me{__typename id}}",
                "requires": undefined,
                "serviceName": "accounts",
                "variableUsages": Array [],
              },
              Object {
                "kind": "Flatten",
                "node": Object {
                  "kind": "Fetch",
                  "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{reviews{body}numberOfReviews}}}",
                  "requires": Array [
                    Object {
                      "kind": "InlineFragment",
                      "selections": Array [
                        Object {
                          "kind": "Field",
                          "name": "__typename",
                          "selections": undefined,
                        },
                        Object {
                          "kind": "Field",
                          "name": "id",
                          "selections": undefined,
                        },
                      ],
                      "typeCondition": "User",
                    },
                  ],
                  "serviceName": "reviews",
                  "variableUsages": Array [],
                },
                "path": Array [
                  "me",
                ],
              },
            ],
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
        Object {
          "kind": "QueryPlan",
          "node": Object {
            "kind": "Sequence",
            "nodes": Array [
              Object {
                "kind": "Fetch",
                "operation": "{topReviews{body author{__typename id}}}",
                "requires": undefined,
                "serviceName": "reviews",
                "variableUsages": Array [],
              },
              Object {
                "kind": "Flatten",
                "node": Object {
                  "kind": "Fetch",
                  "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{name}}}",
                  "requires": Array [
                    Object {
                      "kind": "InlineFragment",
                      "selections": Array [
                        Object {
                          "kind": "Field",
                          "name": "__typename",
                          "selections": undefined,
                        },
                        Object {
                          "kind": "Field",
                          "name": "id",
                          "selections": undefined,
                        },
                      ],
                      "typeCondition": "User",
                    },
                  ],
                  "serviceName": "accounts",
                  "variableUsages": Array [],
                },
                "path": Array [
                  "topReviews",
                  "@",
                  "author",
                ],
              },
            ],
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
          Object {
            "kind": "QueryPlan",
            "node": Object {
              "kind": "Sequence",
              "nodes": Array [
                Object {
                  "kind": "Fetch",
                  "operation": "{topCars{__typename id price}}",
                  "requires": undefined,
                  "serviceName": "product",
                  "variableUsages": Array [],
                },
                Object {
                  "kind": "Flatten",
                  "node": Object {
                    "kind": "Fetch",
                    "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Car{retailPrice}}}",
                    "requires": Array [
                      Object {
                        "kind": "InlineFragment",
                        "selections": Array [
                          Object {
                            "kind": "Field",
                            "name": "__typename",
                            "selections": undefined,
                          },
                          Object {
                            "kind": "Field",
                            "name": "id",
                            "selections": undefined,
                          },
                          Object {
                            "kind": "Field",
                            "name": "price",
                            "selections": undefined,
                          },
                        ],
                        "typeCondition": "Car",
                      },
                    ],
                    "serviceName": "reviews",
                    "variableUsages": Array [],
                  },
                  "path": Array [
                    "topCars",
                    "@",
                  ],
                },
              ],
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
          Object {
            "kind": "QueryPlan",
            "node": Object {
              "kind": "Sequence",
              "nodes": Array [
                Object {
                  "kind": "Fetch",
                  "operation": "{topReviews{author{__typename id}}}",
                  "requires": undefined,
                  "serviceName": "reviews",
                  "variableUsages": Array [],
                },
                Object {
                  "kind": "Flatten",
                  "node": Object {
                    "kind": "Fetch",
                    "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{name}}}",
                    "requires": Array [
                      Object {
                        "kind": "InlineFragment",
                        "selections": Array [
                          Object {
                            "kind": "Field",
                            "name": "__typename",
                            "selections": undefined,
                          },
                          Object {
                            "kind": "Field",
                            "name": "id",
                            "selections": undefined,
                          },
                        ],
                        "typeCondition": "User",
                      },
                    ],
                    "serviceName": "accounts",
                    "variableUsages": Array [],
                  },
                  "path": Array [
                    "topReviews",
                    "@",
                    "author",
                  ],
                },
              ],
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
        Object {
          "kind": "QueryPlan",
          "node": Object {
            "kind": "Sequence",
            "nodes": Array [
              Object {
                "kind": "Fetch",
                "operation": "{topReviews{author{__typename id}}}",
                "requires": undefined,
                "serviceName": "reviews",
                "variableUsages": Array [],
              },
              Object {
                "kind": "Flatten",
                "node": Object {
                  "kind": "Fetch",
                  "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{birthDate}}}",
                  "requires": Array [
                    Object {
                      "kind": "InlineFragment",
                      "selections": Array [
                        Object {
                          "kind": "Field",
                          "name": "__typename",
                          "selections": undefined,
                        },
                        Object {
                          "kind": "Field",
                          "name": "id",
                          "selections": undefined,
                        },
                      ],
                      "typeCondition": "User",
                    },
                  ],
                  "serviceName": "accounts",
                  "variableUsages": Array [],
                },
                "path": Array [
                  "topReviews",
                  "@",
                  "author",
                ],
              },
            ],
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
        Object {
          "kind": "QueryPlan",
          "node": Object {
            "kind": "Fetch",
            "operation": "{topProducts{__typename ...on Book{price}...on Furniture{price}}}",
            "requires": undefined,
            "serviceName": "product",
            "variableUsages": Array [],
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
      Object {
        "kind": "QueryPlan",
        "node": Object {
          "kind": "Sequence",
          "nodes": Array [
            Object {
              "kind": "Fetch",
              "operation": "{topProducts{__typename ...on Book{price __typename isbn}...on Furniture{price __typename upc}}}",
              "requires": undefined,
              "serviceName": "product",
              "variableUsages": Array [],
            },
            Object {
              "kind": "Flatten",
              "node": Object {
                "kind": "Fetch",
                "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{reviews{body}}...on Furniture{reviews{body}}}}",
                "requires": Array [
                  Object {
                    "kind": "InlineFragment",
                    "selections": Array [
                      Object {
                        "kind": "Field",
                        "name": "__typename",
                        "selections": undefined,
                      },
                      Object {
                        "kind": "Field",
                        "name": "isbn",
                        "selections": undefined,
                      },
                    ],
                    "typeCondition": "Book",
                  },
                  Object {
                    "kind": "InlineFragment",
                    "selections": Array [
                      Object {
                        "kind": "Field",
                        "name": "__typename",
                        "selections": undefined,
                      },
                      Object {
                        "kind": "Field",
                        "name": "upc",
                        "selections": undefined,
                      },
                    ],
                    "typeCondition": "Furniture",
                  },
                ],
                "serviceName": "reviews",
                "variableUsages": Array [],
              },
              "path": Array [
                "topProducts",
                "@",
              ],
            },
          ],
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
      Object {
        "kind": "QueryPlan",
        "node": Object {
          "kind": "Sequence",
          "nodes": Array [
            Object {
              "kind": "Fetch",
              "operation": "{books{__typename isbn title year}}",
              "requires": undefined,
              "serviceName": "books",
              "variableUsages": Array [],
            },
            Object {
              "kind": "Flatten",
              "node": Object {
                "kind": "Fetch",
                "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{name}}}",
                "requires": Array [
                  Object {
                    "kind": "InlineFragment",
                    "selections": Array [
                      Object {
                        "kind": "Field",
                        "name": "__typename",
                        "selections": undefined,
                      },
                      Object {
                        "kind": "Field",
                        "name": "isbn",
                        "selections": undefined,
                      },
                      Object {
                        "kind": "Field",
                        "name": "title",
                        "selections": undefined,
                      },
                      Object {
                        "kind": "Field",
                        "name": "year",
                        "selections": undefined,
                      },
                    ],
                    "typeCondition": "Book",
                  },
                ],
                "serviceName": "product",
                "variableUsages": Array [],
              },
              "path": Array [
                "books",
                "@",
              ],
            },
          ],
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
      Object {
        "kind": "QueryPlan",
        "node": Object {
          "kind": "Fetch",
          "operation": "{product(upc:\\"\\"){__typename ...on Book{details{country}}...on Furniture{details{country}}}}",
          "requires": undefined,
          "serviceName": "product",
          "variableUsages": Array [],
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
        Object {
          "kind": "QueryPlan",
          "node": Object {
            "kind": "Sequence",
            "nodes": Array [
              Object {
                "kind": "Fetch",
                "operation": "{topReviews{...__QueryPlanFragment_1__}}fragment __QueryPlanFragment_1__ on Review{body author product{...__QueryPlanFragment_0__}}fragment __QueryPlanFragment_0__ on Product{__typename ...on Book{__typename isbn}...on Furniture{__typename upc}}",
                "requires": undefined,
                "serviceName": "reviews",
                "variableUsages": Array [],
              },
              Object {
                "kind": "Parallel",
                "nodes": Array [
                  Object {
                    "kind": "Sequence",
                    "nodes": Array [
                      Object {
                        "kind": "Flatten",
                        "node": Object {
                          "kind": "Fetch",
                          "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{__typename isbn title year}}}",
                          "requires": Array [
                            Object {
                              "kind": "InlineFragment",
                              "selections": Array [
                                Object {
                                  "kind": "Field",
                                  "name": "__typename",
                                  "selections": undefined,
                                },
                                Object {
                                  "kind": "Field",
                                  "name": "isbn",
                                  "selections": undefined,
                                },
                              ],
                              "typeCondition": "Book",
                            },
                          ],
                          "serviceName": "books",
                          "variableUsages": Array [],
                        },
                        "path": Array [
                          "topReviews",
                          "@",
                          "product",
                        ],
                      },
                      Object {
                        "kind": "Flatten",
                        "node": Object {
                          "kind": "Fetch",
                          "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{name}}}",
                          "requires": Array [
                            Object {
                              "kind": "InlineFragment",
                              "selections": Array [
                                Object {
                                  "kind": "Field",
                                  "name": "__typename",
                                  "selections": undefined,
                                },
                                Object {
                                  "kind": "Field",
                                  "name": "isbn",
                                  "selections": undefined,
                                },
                                Object {
                                  "kind": "Field",
                                  "name": "title",
                                  "selections": undefined,
                                },
                                Object {
                                  "kind": "Field",
                                  "name": "year",
                                  "selections": undefined,
                                },
                              ],
                              "typeCondition": "Book",
                            },
                          ],
                          "serviceName": "product",
                          "variableUsages": Array [],
                        },
                        "path": Array [
                          "topReviews",
                          "@",
                          "product",
                        ],
                      },
                    ],
                  },
                  Object {
                    "kind": "Flatten",
                    "node": Object {
                      "kind": "Fetch",
                      "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Furniture{name price details{country}}...on Book{price details{country}}}}",
                      "requires": Array [
                        Object {
                          "kind": "InlineFragment",
                          "selections": Array [
                            Object {
                              "kind": "Field",
                              "name": "__typename",
                              "selections": undefined,
                            },
                            Object {
                              "kind": "Field",
                              "name": "upc",
                              "selections": undefined,
                            },
                          ],
                          "typeCondition": "Furniture",
                        },
                        Object {
                          "kind": "InlineFragment",
                          "selections": Array [
                            Object {
                              "kind": "Field",
                              "name": "__typename",
                              "selections": undefined,
                            },
                            Object {
                              "kind": "Field",
                              "name": "isbn",
                              "selections": undefined,
                            },
                          ],
                          "typeCondition": "Book",
                        },
                      ],
                      "serviceName": "product",
                      "variableUsages": Array [],
                    },
                    "path": Array [
                      "topReviews",
                      "@",
                      "product",
                    ],
                  },
                ],
              },
            ],
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
        Object {
          "kind": "QueryPlan",
          "node": Object {
            "kind": "Fetch",
            "operation": "{topReviews{body author}}",
            "requires": undefined,
            "serviceName": "reviews",
            "variableUsages": Array [],
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
        Object {
          "kind": "QueryPlan",
          "node": Object {
            "kind": "Fetch",
            "operation": "{topReviews{...__QueryPlanFragment_0__}}fragment __QueryPlanFragment_0__ on Review{id body author}",
            "requires": undefined,
            "serviceName": "reviews",
            "variableUsages": Array [],
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
        Object {
          "kind": "QueryPlan",
          "node": Object {
            "kind": "Sequence",
            "nodes": Array [
              Object {
                "kind": "Fetch",
                "operation": "{reviews:topReviews{...__QueryPlanFragment_1__}}fragment __QueryPlanFragment_1__ on Review{content:body author product{...__QueryPlanFragment_0__}}fragment __QueryPlanFragment_0__ on Product{__typename ...on Book{__typename isbn}...on Furniture{__typename upc}}",
                "requires": undefined,
                "serviceName": "reviews",
                "variableUsages": Array [],
              },
              Object {
                "kind": "Parallel",
                "nodes": Array [
                  Object {
                    "kind": "Sequence",
                    "nodes": Array [
                      Object {
                        "kind": "Flatten",
                        "node": Object {
                          "kind": "Fetch",
                          "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{__typename isbn title year}}}",
                          "requires": Array [
                            Object {
                              "kind": "InlineFragment",
                              "selections": Array [
                                Object {
                                  "kind": "Field",
                                  "name": "__typename",
                                  "selections": undefined,
                                },
                                Object {
                                  "kind": "Field",
                                  "name": "isbn",
                                  "selections": undefined,
                                },
                              ],
                              "typeCondition": "Book",
                            },
                          ],
                          "serviceName": "books",
                          "variableUsages": Array [],
                        },
                        "path": Array [
                          "reviews",
                          "@",
                          "product",
                        ],
                      },
                      Object {
                        "kind": "Flatten",
                        "node": Object {
                          "kind": "Fetch",
                          "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{name}}}",
                          "requires": Array [
                            Object {
                              "kind": "InlineFragment",
                              "selections": Array [
                                Object {
                                  "kind": "Field",
                                  "name": "__typename",
                                  "selections": undefined,
                                },
                                Object {
                                  "kind": "Field",
                                  "name": "isbn",
                                  "selections": undefined,
                                },
                                Object {
                                  "kind": "Field",
                                  "name": "title",
                                  "selections": undefined,
                                },
                                Object {
                                  "kind": "Field",
                                  "name": "year",
                                  "selections": undefined,
                                },
                              ],
                              "typeCondition": "Book",
                            },
                          ],
                          "serviceName": "product",
                          "variableUsages": Array [],
                        },
                        "path": Array [
                          "reviews",
                          "@",
                          "product",
                        ],
                      },
                    ],
                  },
                  Object {
                    "kind": "Flatten",
                    "node": Object {
                      "kind": "Fetch",
                      "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Furniture{name cost:price details{origin:country}}...on Book{cost:price details{origin:country}}}}",
                      "requires": Array [
                        Object {
                          "kind": "InlineFragment",
                          "selections": Array [
                            Object {
                              "kind": "Field",
                              "name": "__typename",
                              "selections": undefined,
                            },
                            Object {
                              "kind": "Field",
                              "name": "upc",
                              "selections": undefined,
                            },
                          ],
                          "typeCondition": "Furniture",
                        },
                        Object {
                          "kind": "InlineFragment",
                          "selections": Array [
                            Object {
                              "kind": "Field",
                              "name": "__typename",
                              "selections": undefined,
                            },
                            Object {
                              "kind": "Field",
                              "name": "isbn",
                              "selections": undefined,
                            },
                          ],
                          "typeCondition": "Book",
                        },
                      ],
                      "serviceName": "product",
                      "variableUsages": Array [],
                    },
                    "path": Array [
                      "reviews",
                      "@",
                      "product",
                    ],
                  },
                ],
              },
            ],
          },
        }
      `);
    });
  });

  it(`should properly expand nested unions with inline fragments`, () => {
    const query = gql`
      query {
        body {
          ... on Image {
            ... on Body {
              ... on Image {
                attributes {
                  url
                }
              }
              ... on Text {
                attributes {
                  bold
                  text
                }
              }
            }
          }
          ... on Text {
            attributes {
              bold
            }
          }
        }
      }
    `;

    const queryPlan = buildQueryPlan(
      buildOperationContext(schema, query, undefined),
    );

    expect(queryPlan).toMatchInlineSnapshot(`
      Object {
        "kind": "QueryPlan",
        "node": Object {
          "kind": "Fetch",
          "operation": "{body{__typename ...on Image{attributes{url}}...on Text{attributes{bold}}}}",
          "requires": undefined,
          "serviceName": "documents",
          "variableUsages": Array [],
        },
      }
    `);
  });

  describe('deduplicates fields / selections regardless of adjacency and type condition nesting', () => {
    it('for inline fragments', () => {
      const query = gql`
        query {
          body {
            ... on Image {
              ... on Text {
                attributes {
                  bold
                }
              }
            }
            ... on Body {
              ... on Text {
                attributes {
                  bold
                  text
                }
              }
            }
            ... on Text {
              attributes {
                bold
                text
              }
            }
          }
        }
      `;

      const queryPlan = buildQueryPlan(
        buildOperationContext(schema, query, undefined),
      );

      expect(queryPlan).toMatchInlineSnapshot(`
        Object {
          "kind": "QueryPlan",
          "node": Object {
            "kind": "Fetch",
            "operation": "{body{__typename ...on Text{attributes{bold text}}}}",
            "requires": undefined,
            "serviceName": "documents",
            "variableUsages": Array [],
          },
        }
      `);
    });

    it('for named fragment spreads', () => {
      const query = gql`
        fragment TextFragment on Text {
          attributes {
            bold
            text
          }
        }

        query {
          body {
            ... on Image {
              ...TextFragment
            }
            ... on Body {
              ...TextFragment
            }
            ...TextFragment
          }
        }
      `;

      const queryPlan = buildQueryPlan(
        buildOperationContext(schema, query, undefined),
      );

      expect(queryPlan).toMatchInlineSnapshot(`
        Object {
          "kind": "QueryPlan",
          "node": Object {
            "kind": "Fetch",
            "operation": "{body{__typename ...on Text{attributes{bold text}}}}",
            "requires": undefined,
            "serviceName": "documents",
            "variableUsages": Array [],
          },
        }
      `);
    });
  });
});
