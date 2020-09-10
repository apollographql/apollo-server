Feature: Query Planning > Variables

# calls product with variable
Scenario: passes variables to root fields
  Given query
  """
  query GetProduct($upc: String!) {
    product(upc: $upc) {
      name
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
          "operation": "query($upc:String!){product(upc:$upc){__typename ...on Book{__typename isbn}...on Furniture{name}}}"
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

# calls product with default variable
Scenario: supports default variables in a variable definition
  Given query
  """
  query GetProduct($upc: String = "1") {
    product(upc: $upc) {
      name
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
          "operation": "query($upc:String=\"1\"){product(upc:$upc){__typename ...on Book{__typename isbn}...on Furniture{name}}}"
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

# calls reviews service with variable; calls accounts
Scenario: passes variables to nested services
  Given query
  """
  query GetProductsForUser($format: Boolean) {
    me {
      reviews {
        body(format: $format)
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
            "variableUsages": ["format"],
            "operation": "query($representations:[_Any!]!$format:Boolean){_entities(representations:$representations){...on User{reviews{body(format:$format)}}}}"
          }
        }
      ]
    }
  }
  """

# XXX I think this test relies on execution to use the default variable, not the query plan
# Scenario: works with default variables in the schema
#   Given query
#   """
#   query LibraryUser($libraryId: ID!, $userId: ID) {
#     library(id: $libraryId) {
#       userAccount(id: $userId) {
#         id
#         name
#       }
#     }
#   }
#   """
#   Then query plan
#   """
#   {
#     "kind": "QueryPlan",
#     "node": {
#       "kind": "Sequence",
#       "nodes": [
#         {
#           "kind": "Fetch",
#           "serviceName": "books",
#           "variableUsages": ["libraryId"],
#           "operation": "query($libraryId:ID!){library(id:$libraryId){__typename id name}}"
#         },
#         {
#           "kind": "Flatten",
#           "path": ["library"],
#           "node": {
#             "kind": "Fetch",
#             "serviceName": "accounts",
#             "requires": [
#               {
#                 "kind": "InlineFragment",
#                 "typeCondition": "Library",
#                 "selections": [
#                   { "kind": "Field", "name": "__typename" },
#                   { "kind": "Field", "name": "id" },
#                   { "kind": "Field", "name": "name" }
#                 ]
#               }
#             ],
#             "variableUsages": ["userId"],
#             "operation": "query($representations:[_Any!]!$userId:ID){_entities(representations:$representations){...on Library{userAccount(id:$userId){id name}}}}"
#           }
#         }
#       ]
#     }
#   }
#   """


