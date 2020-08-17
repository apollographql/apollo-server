Feature: Query Planner > Value Types

Scenario: resolves value types within their respective services
  Given query
  """
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
          "variableUsages": [],
          "operation": "{topProducts(first:10){__typename ...on Book{upc __typename isbn}...on Furniture{upc metadata{__typename ...on KeyValue{key value}...on Error{code message}}__typename}}}"
        },
        {
          "kind": "Parallel",
          "nodes": [
            {
              "kind": "Flatten",
              "path": ["topProducts", "@"],
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
                "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{metadata{__typename ...on KeyValue{key value}...on Error{code message}}}}}"
              }
            },
            {
              "kind": "Flatten",
              "path": ["topProducts", "@"],
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
                "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Book{reviews{metadata{__typename ...on KeyValue{key value}...on Error{code message}}}}...on Furniture{reviews{metadata{__typename ...on KeyValue{key value}...on Error{code message}}}}}}"
              }
            }
          ]
        }
      ]
    }
  }
  """

# can't test as-is without modifying resolvers
# Scenario: resolves @provides fields on value types correctly via contrived example
#   Given query
#   """

#   """
#   Then query plan
#   """
#   {}
#   """
