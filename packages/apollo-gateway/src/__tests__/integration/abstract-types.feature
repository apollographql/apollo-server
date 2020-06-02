Feature: abstract types

  Scenario: handles an abstract type from the base service
    Given federated accounts, books, inventory, product, reviews services
    When I execute
      """
      query GetProduct($upc: String!) {
        product(upc: $upc) {
          upc
          name
          price
        }
      }
      """
    And pass variables
      """
      { "upc": "1" }
      """
    Then the product service should be called
    And the query plan should be
      """
      QueryPlan {
        Sequence {
          Fetch(service: "product") {
            {
              product(upc: $upc) {
                __typename
                ... on Book {
                  upc
                  __typename
                  isbn
                  price
                }
                ... on Furniture {
                  upc
                  name
                  price
                }
              }
            }
          },
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
      }
      """
    And the response should be
      """
      {
        "data": {
          "product": { "upc": "1", "name": "Table", "price": "899" }
        }
      }
      """

  Scenario: can request fields on extended interfaces
    Given federated accounts, books, inventory, product, reviews services
    When I execute
      """
      query GetProduct($upc: String!) {
        product(upc: $upc) {
          inStock
        }
      }
      """
    And pass variables
      """
      { "upc": "1" }
      """
    Then the response should be
      """
      { "data": { "product": { "inStock": true } } }
      """
    And the product, inventory services should be called
    And the query plan should be
      """
      QueryPlan {
        Sequence {
          Fetch(service: "product") {
            {
              product(upc: $upc) {
                __typename
                ... on Book {
                  __typename
                  isbn
                }
                ... on Furniture {
                  __typename
                  sku
                }
              }
            }
          },
          Flatten(path: "product") {
            Fetch(service: "inventory") {
              {
                ... on Book {
                  __typename
                  isbn
                }
                ... on Furniture {
                  __typename
                  sku
                }
              } =>
              {
                ... on Book {
                  inStock
                }
                ... on Furniture {
                  inStock
                }
              }
            },
          },
        },
      }
      """

  Scenario: can request fields on extended types that implement an interface
    Given federated accounts, books, inventory, product, reviews services
    When I execute
      """
      query GetProduct($upc: String!) {
        product(upc: $upc) {
          inStock
          ... on Furniture {
            isHeavy
          }
        }
      }
      """
    And pass variables
      """
      { "upc": "1" }
      """
    Then the response should be
      """
      { "data": { "product": { "inStock": true, "isHeavy": false } } }
      """
    And the product, inventory services should be called
    And the query plan should be
      """
      QueryPlan {
        Sequence {
          Fetch(service: "product") {
            {
              product(upc: $upc) {
                __typename
                ... on Book {
                  __typename
                  isbn
                }
                ... on Furniture {
                  __typename
                  sku
                }
              }
            }
          },
          Flatten(path: "product") {
            Fetch(service: "inventory") {
              {
                ... on Book {
                  __typename
                  isbn
                }
                ... on Furniture {
                  __typename
                  sku
                }
              } =>
              {
                ... on Book {
                  inStock
                }
                ... on Furniture {
                  inStock
                  isHeavy
                }
              }
            },
          },
        },
      }
      """

  Scenario: prunes unfilled type conditions
    Given federated accounts, books, inventory, product, reviews services
    When I execute
      """
      query GetProduct($upc: String!) {
        product(upc: $upc) {
          inStock
          ... on Furniture {
            isHeavy
          }
          ... on Book {
            isCheckedOut
          }
        }
      }
      """
    And pass variables
      """
      { "upc": "1" }
      """
    Then the response should be
      """
      { "data": { "product": { "inStock": true, "isHeavy": false } } }
      """
    And the product, inventory services should be called
    And the query plan should be
      """
      QueryPlan {
        Sequence {
          Fetch(service: "product") {
            {
              product(upc: $upc) {
                __typename
                ... on Book {
                  __typename
                  isbn
                }
                ... on Furniture {
                  __typename
                  sku
                }
              }
            }
          },
          Flatten(path: "product") {
            Fetch(service: "inventory") {
              {
                ... on Book {
                  __typename
                  isbn
                }
                ... on Furniture {
                  __typename
                  sku
                }
              } =>
              {
                ... on Book {
                  inStock
                  isCheckedOut
                }
                ... on Furniture {
                  inStock
                  isHeavy
                }
              }
            },
          },
        },
      }
      """

  Scenario: fetches interfaces returned from other services
    Given federated accounts, books, inventory, product, reviews services
    When I execute
      """
      query GetUserAndProducts {
        me {
          reviews {
            product {
              price
              ... on Book {
                title
              }
            }
          }
        }
      }
      """
    Then the response should be
      """
      {
        "data": {
          "me": {
            "reviews": [
              { "product": { "price": "899" } },
              { "product": { "price": "1299" } },
              { "product": { "price": "49", "title": "Design Patterns" } }
            ]
          }
        }
      }
      """
    And the accounts, reviews, product services should be called
    And the query plan should be
      """
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
                    product {
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
                  }
                }
              }
            },
          },
          Parallel {
            Flatten(path: "me.reviews.@.product") {
              Fetch(service: "product") {
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
                    price
                  }
                  ... on Furniture {
                    price
                  }
                }
              },
            },
            Flatten(path: "me.reviews.@.product") {
              Fetch(service: "books") {
                {
                  ... on Book {
                    __typename
                    isbn
                  }
                } =>
                {
                  ... on Book {
                    title
                  }
                }
              },
            },
          },
        },
      }
      """

  Scenario: fetches composite fields from a foreign type casted to an interface [@provides field]
    Given federated accounts, books, inventory, product, reviews services
    When I execute
      """
      query GetUserAndProducts {
        me {
          reviews {
            product {
              price
              ... on Book {
                name
              }
            }
          }
        }
      }
      """
    Then the response should be
      """
      {
        "data": {
          "me": {
            "reviews": [
              { "product": { "price": "899" } },
              { "product": { "price": "1299" } },
              { "product": { "price": "49", "name": "Design Patterns (1995)" } }
            ]
          }
        }
      }
      """
    And the accounts, reviews, product services should be called
    And the query plan should be
      """
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
                    product {
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
                  }
                }
              }
            },
          },
          Parallel {
            Flatten(path: "me.reviews.@.product") {
              Fetch(service: "product") {
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
                    price
                  }
                  ... on Furniture {
                    price
                  }
                }
              },
            },
            Sequence {
              Flatten(path: "me.reviews.@.product") {
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
              Flatten(path: "me.reviews.@.product") {
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
      """

  Scenario: allows for extending an interface from another service with fields
    Given federated accounts, books, inventory, product, reviews services
    When I execute
      """
      query GetProduct($upc: String!) {
        product(upc: $upc) {
          reviews {
            body
          }
        }
      }
      """
    And pass variables
      """
      { "upc": "1" }
      """
    Then the response should be
      """
      {
        "data": {
          "product": {
            "reviews": [{ "body": "Love it!" }, { "body": "Prefer something else." }]
          }
        }
      }
      """
    And the reviews, product services should be called
    And the query plan should be
      """
      QueryPlan {
        Sequence {
          Fetch(service: "product") {
            {
              product(upc: $upc) {
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
            }
          },
          Flatten(path: "product") {
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
      """

  Scenario: Unions > handles unions from the same service
    Given federated accounts, books, inventory, product, reviews services
    When I execute
      """
      query GetUserAndProducts {
        me {
          reviews {
            product {
              price
              ... on Furniture {
                brand {
                  ... on Ikea {
                    asile
                  }
                  ... on Amazon {
                    referrer
                  }
                }
              }
            }
          }
        }
      }
      """
    Then the response should be
      """
      {
        "data": {
          "me": {
            "reviews": [
              { "product": { "price": "899", "brand": { "asile": 10 } } },
              {
                "product": {
                  "price": "1299",
                  "brand": { "referrer": "https://canopy.co" }
                }
              },
              { "product": { "price": "49" } }
            ]
          }
        }
      }
      """
    And the accounts, reviews, product services should be called
    And the query plan should be
      """
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
                    product {
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
                  }
                }
              }
            },
          },
          Flatten(path: "me.reviews.@.product") {
            Fetch(service: "product") {
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
                  price
                }
                ... on Furniture {
                  price
                  brand {
                    __typename
                    ... on Ikea {
                      asile
                    }
                    ... on Amazon {
                      referrer
                    }
                  }
                }
              }
            },
          },
        },
      }
      """

    Scenario: doesn't expand interfaces with inline type conditions if all possibilities are fufilled by one service
      Given federated products service with schema
        """
        extend type Query {
          topProducts: [Product]
        }

        interface Product {
          name: String
        }

        type Shoe implements Product {
          name: String
        }

        type Car implements Product {
          name: String
        }
        """
      When I execute
        """
        query GetProducts {
          topProducts {
            name
          }
        }
        """
      And the query plan should be
        """
        QueryPlan {
          Fetch(service: "products") {
            {
              topProducts {
                __typename
                name
              }
            }
          },
        }
        """

  # FIXME: turn back on when extending unions is supported in composition
  # Scenario: fetches unions across services
  #   Given federated accounts, books, inventory, product, reviews services
  #   When I execute
  #     """
  #     query GetUserAndProducts {
  #       me {
  #         account {
  #           ... on LibraryAccount {
  #             library {
  #               name
  #             }
  #           }
  #           ... on SMSAccount {
  #             number
  #           }
  #         }
  #       }
  #     }
  #     """
  #   Then the response should be
  #     """
  #     {
  #       "data": {
  #         "me": {
  #           "account": {
  #             "library": {
  #               "name": "NYC Public Library"
  #             }
  #           }
  #         }
  #       }
  #     }
  #     """
  #   And the accounts, books services should be called
