Feature: Query Planning > Fragments

# important thing here: fetches to accounts service
Scenario: supports inline fragments (one level)
  Given query
    """
    query GetUser {
      me {
        ... on User {
          username
        }
      }
    }
    """
  Then query plan
    """
    {"kind":"QueryPlan","node":{"kind":"Fetch","serviceName":"accounts","variableUsages":[],"operation":"{me{username}}"}}
    """

# important things: calls [accounts, reviews, products, books]
Scenario: supports inline fragments (multi level)
  Given query
  """
  query GetUser {
    me {
      ... on User {
        username
        reviews {
          ... on Review {
            body
            product {
              ... on Product {
                ... on Book {
                  title
                }
                ... on Furniture {
                  name
                }
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
          "operation": "{me{username __typename id}}"
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
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{reviews{body product{__typename ...on Book{__typename isbn}...on Furniture{__typename upc}}}}}}"
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
                    "typeCondition": "Furniture",
                    "selections": [
                      { "kind": "Field", "name": "__typename" },
                      { "kind": "Field", "name": "upc" }
                    ]
                  }
                ],
                "variableUsages": [],
                "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Furniture{name}}}"
              }
            }
          ]
        }
      ]
    }
  }
  """

Scenario: supports named fragments (one level)
  Given query
  """
  query GetUser {
    me {
      ...userDetails
    }
  }

  fragment userDetails on User {
    username
  }
  """
  Then query plan
  """
  {
    "kind": "QueryPlan",
    "node": {
      "kind": "Fetch",
      "serviceName": "accounts",
      "variableUsages": [],
      "operation": "{me{username}}"
    }
  }
  """

# important: calls accounts service
Scenario: supports multiple named fragments (one level, mixed ordering)
  Given query
  """
  fragment userInfo on User {
    name
  }
  query GetUser {
    me {
      ...userDetails
      ...userInfo
    }
  }

  fragment userDetails on User {
    username
  }
  """
  Then query plan
  """
  {
    "kind": "QueryPlan",
    "node": {
      "kind": "Fetch",
      "serviceName": "accounts",
      "variableUsages": [],
      "operation": "{me{username name}}"
    }
  }
  """

Scenario: supports multiple named fragments (multi level, mixed ordering)
  Given query
  """
  fragment reviewDetails on Review {
    body
  }
  query GetUser {
    me {
      ...userDetails
    }
  }

  fragment userDetails on User {
    username
    reviews {
      ...reviewDetails
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
          "operation": "{me{username __typename id}}"
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
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{reviews{body}}}}"
          }
        }
      ]
    }
  }
  """

# important: calls accounts & reviews, uses `variableUsages`
Scenario: supports variables within fragments
  Given query
  """
  query GetUser($format: Boolean) {
    me {
      ...userDetails
    }
  }

  fragment userDetails on User {
    username
    reviews {
      body(format: $format)
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
          "operation": "{me{username __typename id}}"
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
            "variableUsages": ["format"],
            "operation": "query($representations:[_Any!]!$format:Boolean){_entities(representations:$representations){...on User{reviews{body(format:$format)}}}}"
          }
        }
      ]
    }
  }
  """

Scenario: supports root fragments
  Given query
  """
  query GetUser {
    ... on Query {
      me {
        username
      }
    }
  }
  """
  Then query plan
  """
  {
    "kind": "QueryPlan",
    "node": {
      "kind": "Fetch",
      "serviceName": "accounts",
      "variableUsages": [],
      "operation": "{me{username}}"
    }
  }
  """
