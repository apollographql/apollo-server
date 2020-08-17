Feature: Query Planning > Mutations

Scenario: supports mutations
  Given query
  """
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      reviews {
        product {
          upc
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
          "variableUsages": ["username", "password"],
          "operation": "mutation($username:String!$password:String!){login(username:$username password:$password){__typename id}}"
        },
        {
          "kind": "Flatten",
          "path": ["login"],
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
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{reviews{product{__typename ...on Book{__typename isbn}...on Furniture{upc}}}}}}"
          }
        },
        {
          "kind": "Flatten",
          "path": ["login", "reviews", "@", "product"],
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
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{upc}}}"
          }
        }
      ]
    }
  }
  """

Scenario: mutations across service boundaries
  Given query
  """
  mutation Review($upc: String!, $body: String!) {
    reviewProduct(upc: $upc, body: $body) {
      ... on Furniture {
        name
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
          "serviceName": "reviews",
          "variableUsages": ["upc", "body"],
          "operation": "mutation($upc:String!$body:String!){reviewProduct(upc:$upc body:$body){__typename ...on Furniture{__typename upc}}}"
        },
        {
          "kind": "Flatten",
          "path": ["reviewProduct"],
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
  }

  """

Scenario: multiple root mutations
  Given query
  """
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
          "variableUsages": ["username", "password"],
          "operation": "mutation($username:String!$password:String!){login(username:$username password:$password){__typename id}}"
        },
        {
          "kind": "Flatten",
          "path": ["login"],
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
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{reviews{product{__typename ...on Book{__typename isbn}...on Furniture{upc}}}}}}"
          }
        },
        {
          "kind": "Flatten",
          "path": ["login", "reviews", "@", "product"],
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
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{upc}}}"
          }
        },
        {
          "kind": "Fetch",
          "serviceName": "reviews",
          "variableUsages": ["upc", "body"],
          "operation": "mutation($upc:String!$body:String!){reviewProduct(upc:$upc body:$body){__typename ...on Furniture{__typename upc}}}"
        },
        {
          "kind": "Flatten",
          "path": ["reviewProduct"],
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
  }
  """

# important: order: Review > Update > Login > Delete
Scenario: multiple root mutations with correct service order
  Given query
  """
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
          "serviceName": "reviews",
          "variableUsages": ["upc", "body", "updatedReview"],
          "operation": "mutation($upc:String!$body:String!$updatedReview:UpdateReviewInput!){reviewProduct(upc:$upc body:$body){__typename ...on Furniture{upc}}updateReview(review:$updatedReview){id body}}"
        },
        {
          "kind": "Fetch",
          "serviceName": "accounts",
          "variableUsages": ["username", "password"],
          "operation": "mutation($username:String!$password:String!){login(username:$username password:$password){__typename id}}"
        },
        {
          "kind": "Flatten",
          "path": ["login"],
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
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{reviews{product{__typename ...on Book{__typename isbn}...on Furniture{upc}}}}}}"
          }
        },
        {
          "kind": "Flatten",
          "path": ["login", "reviews", "@", "product"],
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
              }
            ],
            "variableUsages": [],
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{upc}}}"
          }
        },
        {
          "kind": "Fetch",
          "serviceName": "reviews",
          "variableUsages": ["reviewId"],
          "operation": "mutation($reviewId:ID!){deleteReview(id:$reviewId)}"
        }
      ]
    }
  }
  """

