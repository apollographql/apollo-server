Feature: Query Planning > Boolean

Scenario: supports @skip when a boolean condition is met
  Given query
  """
  query GetReviewers {
    topReviews {
      body
      author @skip(if: true) {
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
          "variableUsages": [],
          "operation": "{topReviews{body author@skip(if:true){__typename id}}}"
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
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{name}}}"
          }
        }
      ]
    }
  }
  """

Scenario: supports @skip when a boolean condition is met (variable driven)
  Given query
  """
  query GetReviewers($skip: Boolean! = true) {
    topReviews {
      body
      author @skip(if: $skip) {
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
      "serviceName": "reviews",
      "variableUsages": ["skip"],
      "operation": "query($skip:Boolean!=true){topReviews{body author@skip(if:$skip){username}}}"
    }
  }
  """

Scenario: supports @skip when a boolean condition is not met
  Given query
  """
  query GetReviewers {
    topReviews {
      body
      author @skip(if: false) {
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
          "variableUsages": [],
          "operation": "{topReviews{body author@skip(if:false){__typename id}}}"
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
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{name}}}"
          }
        }
      ]
    }
  }
  """

Scenario: supports @skip when a boolean condition is not met (variable driven)
  Given query
  """
  query GetReviewers($skip: Boolean!) {
    topReviews {
      body
      author @skip(if: $skip) {
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
          "variableUsages": ["skip"],
          "operation": "query($skip:Boolean!){topReviews{body author@skip(if:$skip){__typename id}}}"
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
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{name}}}"
          }
        }
      ]
    }
  }
  """

Scenario: supports @include when a boolean condition is not met
  Given query
  """
  query GetReviewers {
    topReviews {
      body
      author @include(if: false) {
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
      "serviceName": "reviews",
      "variableUsages": [],
      "operation": "{topReviews{body author@include(if:false){username}}}"
    }
  }
  """

Scenario: supports @include when a boolean condition is not met (variable driven)
  Given query
  """
  query GetReviewers($include: Boolean! = false) {
    topReviews {
      body
      author @include(if: $include) {
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
      "serviceName": "reviews",
      "variableUsages": ["include"],
      "operation": "query($include:Boolean!=false){topReviews{body author@include(if:$include){username}}}"
    }
  }
  """

Scenario: supports @include when a boolean condition is met
  Given query
  """
  query GetReviewers {
    topReviews {
      body
      author @include(if: true) {
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
          "variableUsages": [],
          "operation": "{topReviews{body author@include(if:true){__typename id}}}"
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
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{name}}}"
          }
        }
      ]
    }
  }
  """



Scenario: supports @include when a boolean condition is met (variable driven)
  Given query
  """
  query GetReviewers($include: Boolean!) {
    topReviews {
      body
      author @include(if: $include) {
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
          "variableUsages": ["include"],
          "operation": "query($include:Boolean!){topReviews{body author@include(if:$include){__typename id}}}"
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
            "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on User{name}}}"
          }
        }
      ]
    }
  }
  """
