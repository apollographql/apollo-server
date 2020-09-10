Feature: Query Planning > Custom Directives

Scenario: successfully passes directives along in requests to an underlying service
  Given query
  """
  query GetReviewers {
    topReviews {
      body @stream
    }
  }
  """
  Then query plan
  """
  {
    "kind": "QueryPlan",
    "node": {
      "kind": "Fetch",
      "serviceName": "reviews",
      "variableUsages": [],
      "operation": "{topReviews{body@stream}}"
    }
  }
  """

Scenario: successfully passes directives and their variables along in requests to underlying services
  Given query
  """
  query GetReviewers {
    topReviews {
      body @stream
      author @transform(from: "JSON") {
        name @stream
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
          "variableUsages": [],
          "operation": "{topReviews{body@stream author@transform(from:\"JSON\"){__typename id}}}"
        },
        {
          "kind": "Flatten",
          "path": ["topReviews", "@", "author"],
          "node": {
            "kind": "Fetch",
            "serviceName": "accounts",
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
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{name@stream}}}"
          }
        }
      ]
    }
  }
  """
