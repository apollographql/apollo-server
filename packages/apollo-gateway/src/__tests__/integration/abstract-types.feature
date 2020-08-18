Feature: Query Planner > Abstract Types

Scenario: handles an abstract type from the base service
  Given query
  """
  query GetProduct($upc: String!) {
    product(upc: $upc) {
      upc
      name
      price
    }
  }
  """
  Then query plan
  """
  {
    "kind": "QueryPlan",
    "node": {
      "kind": "Sequence",
      "nodes": [
        {
          "kind": "Fetch",
          "serviceName": "product",
          "variableUsages": ["upc"],
          "operation": "query($upc:String!){product(upc:$upc){__typename ...on Book{upc __typename isbn price}...on Furniture{upc name price}}}"
        },
        {
          "kind": "Flatten",
          "path": ["product"],
          "node": {
            "kind": "Fetch",
            "serviceName": "books",
            "requires": [
              {
                "kind": "InlineFragment",
                "typeCondition": "Book",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "isbn" }
                ]
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{__typename isbn title year}}}"
          }
        },
        {
          "kind": "Flatten",
          "path": ["product"],
          "node": {
            "kind": "Fetch",
            "serviceName": "product",
            "requires": [
              {
                "kind": "InlineFragment",
                "typeCondition": "Book",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "isbn" },
                  { "kind": "Field", "name": "title" },
                  { "kind": "Field", "name": "year" }
                ]
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{name}}}"
          }
        }
      ]
    }
  }
  """

Scenario: can request fields on extended interfaces
  Given query
  """
  query GetProduct($upc: String!) {
    product(upc: $upc) {
      inStock
    }
  }
  """
  Then query plan
  """
  {
    "kind": "QueryPlan",
    "node": {
      "kind": "Sequence",
      "nodes": [
        {
          "kind": "Fetch",
          "serviceName": "product",
          "variableUsages": ["upc"],
          "operation": "query($upc:String!){product(upc:$upc){__typename ...on Book{__typename isbn}...on Furniture{__typename sku}}}"
        },
        {
          "kind": "Flatten",
          "path": ["product"],
          "node": {
            "kind": "Fetch",
            "serviceName": "inventory",
            "requires": [
              {
                "kind": "InlineFragment",
                "typeCondition": "Book",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "isbn" }
                ]
              },
              {
                "kind": "InlineFragment",
                "typeCondition": "Furniture",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "sku" }
                ]
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{inStock}...on Furniture{inStock}}}"
          }
        }
      ]
    }
  }
  """

Scenario: can request fields on extended types that implement an interface
  Given query
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
  Then query plan
  """
  {
    "kind": "QueryPlan",
    "node": {
      "kind": "Sequence",
      "nodes": [
        {
          "kind": "Fetch",
          "serviceName": "product",
          "variableUsages": ["upc"],
          "operation": "query($upc:String!){product(upc:$upc){__typename ...on Book{__typename isbn}...on Furniture{__typename sku}}}"
        },
        {
          "kind": "Flatten",
          "path": ["product"],
          "node": {
            "kind": "Fetch",
            "serviceName": "inventory",
            "requires": [
              {
                "kind": "InlineFragment",
                "typeCondition": "Book",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "isbn" }
                ]
              },
              {
                "kind": "InlineFragment",
                "typeCondition": "Furniture",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "sku" }
                ]
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{inStock}...on Furniture{inStock isHeavy}}}"
          }
        }
      ]
    }
  }
  """

Scenario: prunes unfilled type conditions
  Given query
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
  Then query plan
  """
  {
    "kind": "QueryPlan",
    "node": {
      "kind": "Sequence",
      "nodes": [
        {
          "kind": "Fetch",
          "serviceName": "product",
          "variableUsages": ["upc"],
          "operation": "query($upc:String!){product(upc:$upc){__typename ...on Book{__typename isbn}...on Furniture{__typename sku}}}"
        },
        {
          "kind": "Flatten",
          "path": ["product"],
          "node": {
            "kind": "Fetch",
            "serviceName": "inventory",
            "requires": [
              {
                "kind": "InlineFragment",
                "typeCondition": "Book",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "isbn" }
                ]
              },
              {
                "kind": "InlineFragment",
                "typeCondition": "Furniture",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "sku" }
                ]
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{inStock isCheckedOut}...on Furniture{inStock isHeavy}}}"
          }
        }
      ]
    }
  }
  """

Scenario: fetches interfaces returned from other services
  Given query
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
  Then query plan
  """
  {
    "kind": "QueryPlan",
    "node": {
      "kind": "Sequence",
      "nodes": [
        {
          "kind": "Fetch",
          "serviceName": "accounts",
          "variableUsages": [],
          "operation": "{me{__typename id}}"
        },
        {
          "kind": "Flatten",
          "path": ["me"],
          "node": {
            "kind": "Fetch",
            "serviceName": "reviews",
            "requires": [
              {
                "kind": "InlineFragment",
                "typeCondition": "User",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "id" }
                ]
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{reviews{product{__typename ...on Book{__typename isbn}...on Furniture{__typename upc}}}}}}"
          }
        },
        {
          "kind": "Parallel",
          "nodes": [
            {
              "kind": "Flatten",
              "path": ["me", "reviews", "@", "product"],
              "node": {
                "kind": "Fetch",
                "serviceName": "product",
                "requires": [
                  {
                    "kind": "InlineFragment",
                    "typeCondition": "Book",
                    "selections": [
                      { "kind": "Field", "name": "__typename" },
                      { "kind": "Field", "name": "isbn" }
                    ]
                  },
                  {
                    "kind": "InlineFragment",
                    "typeCondition": "Furniture",
                    "selections": [
                      { "kind": "Field", "name": "__typename" },
                      { "kind": "Field", "name": "upc" }
                    ]
                  }
                ],
                "variableUsages": [],
                "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{price}...on Furniture{price}}}"
              }
            },
            {
              "kind": "Flatten",
              "path": ["me", "reviews", "@", "product"],
              "node": {
                "kind": "Fetch",
                "serviceName": "books",
                "requires": [
                  {
                    "kind": "InlineFragment",
                    "typeCondition": "Book",
                    "selections": [
                      { "kind": "Field", "name": "__typename" },
                      { "kind": "Field", "name": "isbn" }
                    ]
                  }
                ],
                "variableUsages": [],
                "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{title}}}"
              }
            }
          ]
        }
      ]
    }
  }
  """

Scenario: fetches composite fields from a foreign type casted to an interface [@provides field
  Given query
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
  Then query plan
  """
  {
    "kind": "QueryPlan",
    "node": {
      "kind": "Sequence",
      "nodes": [
        {
          "kind": "Fetch",
          "serviceName": "accounts",
          "variableUsages": [],
          "operation": "{me{__typename id}}"
        },
        {
          "kind": "Flatten",
          "path": ["me"],
          "node": {
            "kind": "Fetch",
            "serviceName": "reviews",
            "requires": [
              {
                "kind": "InlineFragment",
                "typeCondition": "User",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "id" }
                ]
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{reviews{product{__typename ...on Book{__typename isbn}...on Furniture{__typename upc}}}}}}"
          }
        },
        {
          "kind": "Parallel",
          "nodes": [
            {
              "kind": "Flatten",
              "path": ["me", "reviews", "@", "product"],
              "node": {
                "kind": "Fetch",
                "serviceName": "product",
                "requires": [
                  {
                    "kind": "InlineFragment",
                    "typeCondition": "Book",
                    "selections": [
                      { "kind": "Field", "name": "__typename" },
                      { "kind": "Field", "name": "isbn" }
                    ]
                  },
                  {
                    "kind": "InlineFragment",
                    "typeCondition": "Furniture",
                    "selections": [
                      { "kind": "Field", "name": "__typename" },
                      { "kind": "Field", "name": "upc" }
                    ]
                  }
                ],
                "variableUsages": [],
                "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{price}...on Furniture{price}}}"
              }
            },
            {
              "kind": "Sequence",
              "nodes": [
                {
                  "kind": "Flatten",
                  "path": ["me", "reviews", "@", "product"],
                  "node": {
                    "kind": "Fetch",
                    "serviceName": "books",
                    "requires": [
                      {
                        "kind": "InlineFragment",
                        "typeCondition": "Book",
                        "selections": [
                          { "kind": "Field", "name": "__typename" },
                          { "kind": "Field", "name": "isbn" }
                        ]
                      }
                    ],
                    "variableUsages": [],
                    "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{__typename isbn title year}}}"
                  }
                },
                {
                  "kind": "Flatten",
                  "path": ["me", "reviews", "@", "product"],
                  "node": {
                    "kind": "Fetch",
                    "serviceName": "product",
                    "requires": [
                      {
                        "kind": "InlineFragment",
                        "typeCondition": "Book",
                        "selections": [
                          { "kind": "Field", "name": "__typename" },
                          { "kind": "Field", "name": "isbn" },
                          { "kind": "Field", "name": "title" },
                          { "kind": "Field", "name": "year" }
                        ]
                      }
                    ],
                    "variableUsages": [],
                    "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{name}}}"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  }
  """

Scenario: allows for extending an interface from another service with fields
  Given query
  """
  query GetProduct($upc: String!) {
    product(upc: $upc) {
      reviews {
        body
      }
    }
  }
  """
  Then query plan
  """
  {
    "kind": "QueryPlan",
    "node": {
      "kind": "Sequence",
      "nodes": [
        {
          "kind": "Fetch",
          "serviceName": "product",
          "variableUsages": ["upc"],
          "operation": "query($upc:String!){product(upc:$upc){__typename ...on Book{__typename isbn}...on Furniture{__typename upc}}}"
        },
        {
          "kind": "Flatten",
          "path": ["product"],
          "node": {
            "kind": "Fetch",
            "serviceName": "reviews",
            "requires": [
              {
                "kind": "InlineFragment",
                "typeCondition": "Book",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "isbn" }
                ]
              },
              {
                "kind": "InlineFragment",
                "typeCondition": "Furniture",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "upc" }
                ]
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{reviews{body}}...on Furniture{reviews{body}}}}"
          }
        }
      ]
    }
  }
  """

Scenario: handles unions from the same service
  Given query
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
  Then query plan
  """
  {
    "kind": "QueryPlan",
    "node": {
      "kind": "Sequence",
      "nodes": [
        {
          "kind": "Fetch",
          "serviceName": "accounts",
          "variableUsages": [],
          "operation": "{me{__typename id}}"
        },
        {
          "kind": "Flatten",
          "path": ["me"],
          "node": {
            "kind": "Fetch",
            "serviceName": "reviews",
            "requires": [
              {
                "kind": "InlineFragment",
                "typeCondition": "User",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "id" }
                ]
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{reviews{product{__typename ...on Book{__typename isbn}...on Furniture{__typename upc}}}}}}"
          }
        },
        {
          "kind": "Flatten",
          "path": ["me", "reviews", "@", "product"],
          "node": {
            "kind": "Fetch",
            "serviceName": "product",
            "requires": [
              {
                "kind": "InlineFragment",
                "typeCondition": "Book",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "isbn" }
                ]
              },
              {
                "kind": "InlineFragment",
                "typeCondition": "Furniture",
                "selections": [
                  { "kind": "Field", "name": "__typename" },
                  { "kind": "Field", "name": "upc" }
                ]
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{price}...on Furniture{price brand{__typename ...on Ikea{asile}...on Amazon{referrer}}}}}"
          }
        }
      ]
    }
  }
  """

# can't test this yet -- original test overwrites schema def, which we don't support yet
# Scenario: doesn't expand interfaces with inline type conditions if all possibilities are fufilled by one service
#   Given query
#   """
#   query GetProducts {
#         topProducts {
#           name
#         }
#       }
#   """
#   Then query plan
#   """
#   {}
#   """
