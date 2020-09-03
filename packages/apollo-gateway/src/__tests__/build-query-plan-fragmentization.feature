Feature: Build Query Plan > Auto-fragmentization

Scenario: experimental compression to downstream services should generate fragments internally to downstream requests
  Given query
    """
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
    """
  When using autofragmentization
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
            "operation": "{topReviews{...__QueryPlanFragment_1__}}fragment __QueryPlanFragment_1__ on Review{body author product{...__QueryPlanFragment_0__}}fragment __QueryPlanFragment_0__ on Product{__typename ...on Book{__typename isbn}...on Furniture{__typename upc}}"
          },
          {
            "kind": "Parallel",
            "nodes": [
              {
                "kind": "Sequence",
                "nodes": [
                  {
                    "kind": "Flatten",
                    "path": ["topReviews", "@", "product"],
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
                    "path": ["topReviews", "@", "product"],
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
              },
              {
                "kind": "Flatten",
                "path": ["topReviews", "@", "product"],
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
                    },
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
                  "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Furniture{name price details{country}}...on Book{price details{country}}}}"
                }
              }
            ]
          }
        ]
      }
    }
    """

Scenario: experimental compression to downstream services shouldn't generate fragments for selection sets of length 2 or less
  Given query
    """
    query {
      topReviews {
        body
        author
      }
    }
    """
  When using autofragmentization
  Then query plan
    """
    {
      "kind": "QueryPlan",
      "node": {
        "kind": "Fetch",
        "serviceName": "reviews",
        "variableUsages": [],
        "operation": "{topReviews{body author}}"
      }
    }
    """

Scenario: experimental compression to downstream services should generate fragments for selection sets of length 3 or greater
  Given query
    """
    query {
      topReviews {
        id
        body
        author
      }
    }
    """
  When using autofragmentization
  Then query plan
    """
    {
      "kind": "QueryPlan",
      "node": {
        "kind": "Fetch",
        "serviceName": "reviews",
        "variableUsages": [],
        "operation": "{topReviews{...__QueryPlanFragment_0__}}fragment __QueryPlanFragment_0__ on Review{id body author}"
      }
    }
    """

Scenario: experimental compression to downstream services should generate fragments correctly when aliases are used
  Given query
    """
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
    """
  When using autofragmentization
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
            "operation": "{reviews:topReviews{...__QueryPlanFragment_1__}}fragment __QueryPlanFragment_1__ on Review{content:body author product{...__QueryPlanFragment_0__}}fragment __QueryPlanFragment_0__ on Product{__typename ...on Book{__typename isbn}...on Furniture{__typename upc}}"
          },
          {
            "kind": "Parallel",
            "nodes": [
              {
                "kind": "Sequence",
                "nodes": [
                  {
                    "kind": "Flatten",
                    "path": ["reviews", "@", "product"],
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
                    "path": ["reviews", "@", "product"],
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
              },
              {
                "kind": "Flatten",
                "path": ["reviews", "@", "product"],
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
                    },
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
                  "operation": "query($representations:[_Any!]!){_entities(representations:$representations){...on Furniture{name cost:price details{origin:country}}...on Book{cost:price details{origin:country}}}}"
                }
              }
            ]
          }
        ]
      }
    }
    """
