Feature: Build Query Plan

Scenario: should not confuse union types with overlapping field names
  Given query
    """
    query {
      body {
        ...on Image {
          attributes {
            url
          }
        }
        ...on Text {
          attributes {
            bold
            text
          }
        }
      }
    }
    """
  Then the query plan should be
    """
    QueryPlan {
      Fetch(service: "documents") {
        {
          body {
            __typename
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
      },
    }
    """

Scenario: should use a single fetch when requesting a root field from one service
  Given query
    """
    query {
      me {
        name
      }
    }
    """
  Then the query plan should be
    """
    QueryPlan {
      Fetch(service: "accounts") {
        {
          me {
            name
          }
        }
      },
    }
    """

Scenario: should use two independent fetches when requesting root fields from two services
  Given query
    """
    query {
      me {
        name
      }
      topProducts {
        name
      }
    }
    """
  Then the query plan should be
    """
    QueryPlan {
      Parallel {
        Fetch(service: "accounts") {
          {
            me {
              name
            }
          }
        },
        Sequence {
          Fetch(service: "product") {
            {
              topProducts {
                __typename
                ... on Book {
                  __typename
                  isbn
                }
                ... on Furniture {
                  name
                }
              }
            }
          },
          Flatten(path: "topProducts.@") {
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
          Flatten(path: "topProducts.@") {
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
    }
    """

Scenario: should use a single fetch when requesting multiple root fields from the same service
  Given query
  """
  query {
    topProducts {
      name
    }
    product(upc: "1") {
      name
    }
  }
  """
  Then the query plan should be
  """
  QueryPlan {
    Sequence {
      Fetch(service: "product") {
        {
          topProducts {
            __typename
            ... on Book {
              __typename
              isbn
            }
            ... on Furniture {
              name
            }
          }
          product(upc: "1") {
            __typename
            ... on Book {
              __typename
              isbn
            }
            ... on Furniture {
              name
            }
          }
        }
      },
      Parallel {
        Sequence {
          Flatten(path: "topProducts.@") {
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
          Flatten(path: "topProducts.@") {
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
        Sequence {
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
      },
    },
  }
  """

Scenario: should use a single fetch when requesting relationship subfields from the same service
  Given query
    """
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
    """
  Then the query plan should be
    """
    QueryPlan {
      Fetch(service: "reviews") {
        {
          topReviews {
            body
            author {
              reviews {
                body
              }
            }
          }
        }
      },
    }
    """

Scenario: should use a single fetch when requesting relationship subfields and provided keys from the same service
  Given query
    """
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
    """
  Then the query plan should be
    """
    QueryPlan {
      Fetch(service: "reviews") {
        {
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
      },
    }
    """

Scenario: when requesting an extension field from another service, it should add the field's representation requirements to the parent selection set and use a dependent fetch
  Given query
  """
  query {
    me {
      name
      reviews {
        body
      }
    }
  }
  """
  Then the query plan should be
  """
  QueryPlan {
    Sequence {
      Fetch(service: "accounts") {
        {
          me {
            name
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
                body
              }
            }
          }
        },
      },
    },
  }
  """

Scenario: when requesting an extension field from another service, when the parent selection set is empty, should add the field's requirements to the parent selection set and use a dependent fetch
  Given query
  """
  query {
    me {
      reviews {
        body
      }
    }
  }
  """
  Then the query plan should be
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
                body
              }
            }
          }
        },
      },
    },
  }
  """

Scenario: when requesting an extension field from another service, should only add requirements once
  Given query
  """
  query {
    me {
      reviews {
        body
      }
      numberOfReviews
    }
  }
  """
  Then the query plan should be
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
                body
              }
              numberOfReviews
            }
          }
        },
      },
    },
  }
  """

Scenario: when requesting a composite field with subfields from another service, it should add key fields to the parent selection set and use a dependent fetch
  Given query
  """
  query {
    topReviews {
      body
      author {
        name
      }
    }
  }
  """
  Then the query plan should be
  """
  QueryPlan {
    Sequence {
      Fetch(service: "reviews") {
        {
          topReviews {
            body
            author {
              __typename
              id
            }
          }
        }
      },
      Flatten(path: "topReviews.@.author") {
        Fetch(service: "accounts") {
          {
            ... on User {
              __typename
              id
            }
          } =>
          {
            ... on User {
              name
            }
          }
        },
      },
    },
  }
  """

Scenario: when requesting a composite field with subfields from another service, when requesting a field defined in another service which requires a field in the base service, it should add the field provided by base service in first Fetch
  Given query
  """
  query {
    topCars {
      retailPrice
    }
  }
  """
  Then the query plan should be
  """
  QueryPlan {
    Sequence {
      Fetch(service: "product") {
        {
          topCars {
            __typename
            id
            price
          }
        }
      },
      Flatten(path: "topCars.@") {
        Fetch(service: "reviews") {
          {
            ... on Car {
              __typename
              id
              price
            }
          } =>
          {
            ... on Car {
              retailPrice
            }
          }
        },
      },
    },
  }
  """

Scenario: when requesting a composite field with subfields from another service, when the parent selection set is empty, it should add key fields to the parent selection set and use a dependent fetch
  Given query
  """
  query {
    topReviews {
      author {
        name
      }
    }
  }
  """
  Then the query plan should be
  """
  QueryPlan {
    Sequence {
      Fetch(service: "reviews") {
        {
          topReviews {
            author {
              __typename
              id
            }
          }
        }
      },
      Flatten(path: "topReviews.@.author") {
        Fetch(service: "accounts") {
          {
            ... on User {
              __typename
              id
            }
          } =>
          {
            ... on User {
              name
            }
          }
        },
      },
    },
  }
  """

Scenario: when requesting a relationship field with extension subfields from a different service, it should first fetch the object using a key from the base service and then pass through the requirements
  Given query
  """
  query {
    topReviews {
      author {
        birthDate
      }
    }
  }
  """
  Then the query plan should be
  """
  QueryPlan {
    Sequence {
      Fetch(service: "reviews") {
        {
          topReviews {
            author {
              __typename
              id
            }
          }
        }
      },
      Flatten(path: "topReviews.@.author") {
        Fetch(service: "accounts") {
          {
            ... on User {
              __typename
              id
            }
          } =>
          {
            ... on User {
              birthDate
            }
          }
        },
      },
    },
  }
  """

Scenario: for abstract types, it should add __typename when fetching objects of an interface type from a service
  Given query
  """
  query {
    topProducts {
      price
    }
  }
  """
  Then the query plan should be
  """
  QueryPlan {
    Fetch(service: "product") {
      {
        topProducts {
          __typename
          ... on Book {
            price
          }
          ... on Furniture {
            price
          }
        }
      }
    },
  }
  """

Scenario: should break up when traversing an extension field on an interface type from a service
  Given query
  """
  query {
    topProducts {
      price
      reviews {
        body
      }
    }
  }
  """
  Then the query plan should be
  """
  QueryPlan {
    Sequence {
      Fetch(service: "product") {
        {
          topProducts {
            __typename
            ... on Book {
              price
              __typename
              isbn
            }
            ... on Furniture {
              price
              __typename
              upc
            }
          }
        }
      },
      Flatten(path: "topProducts.@") {
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

Scenario: interface fragments should expand into possible types only
  Given query
  """
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
  """
  Then the query plan should be
  """
  QueryPlan {
    Sequence {
      Fetch(service: "books") {
        {
          books {
            __typename
            isbn
            title
            year
          }
        }
      },
      Flatten(path: "books.@") {
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

Scenario: interface inside interface should expand into possible types only
  Given query
  """
  query {
    product(upc: "") {
      details {
        country
      }
    }
  }
  """
  Then the query plan should be
  """
  QueryPlan {
    Fetch(service: "product") {
      {
        product(upc: "") {
          __typename
          ... on Book {
            details {
              country
            }
          }
          ... on Furniture {
            details {
              country
            }
          }
        }
      }
    },
  }
  """

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
  Then the query plan should be
  """
  QueryPlan {
    Sequence {
      Fetch(service: "reviews") {
        {
          topReviews {
            ...__QueryPlanFragment_1__
          }
        }
        fragment __QueryPlanFragment_1__ on Review {
          body
          author
          product {
            ...__QueryPlanFragment_0__
          }
        }
        fragment __QueryPlanFragment_0__ on Product {
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
      },
      Parallel {
        Sequence {
          Flatten(path: "topReviews.@.product") {
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
          Flatten(path: "topReviews.@.product") {
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
        Flatten(path: "topReviews.@.product") {
          Fetch(service: "product") {
            {
              ... on Furniture {
                __typename
                upc
              }
              ... on Book {
                __typename
                isbn
              }
            } =>
            {
              ... on Furniture {
                name
                price
                details {
                  country
                }
              }
              ... on Book {
                price
                details {
                  country
                }
              }
            }
          },
        },
      },
    },
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
  Then the query plan should be
  """
  QueryPlan {
    Fetch(service: "reviews") {
      {
        topReviews {
          body
          author
        }
      }
    },
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
  Then the query plan should be
  """
  QueryPlan {
    Fetch(service: "reviews") {
      {
        topReviews {
          ...__QueryPlanFragment_0__
        }
      }
      fragment __QueryPlanFragment_0__ on Review {
        id
        body
        author
      }
    },
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
  Then the query plan should be
  """
  QueryPlan {
    Sequence {
      Fetch(service: "reviews") {
        {
          reviews: topReviews {
            ...__QueryPlanFragment_1__
          }
        }
        fragment __QueryPlanFragment_1__ on Review {
          content: body
          author
          product {
            ...__QueryPlanFragment_0__
          }
        }
        fragment __QueryPlanFragment_0__ on Product {
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
      },
      Parallel {
        Sequence {
          Flatten(path: "reviews.@.product") {
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
          Flatten(path: "reviews.@.product") {
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
        Flatten(path: "reviews.@.product") {
          Fetch(service: "product") {
            {
              ... on Furniture {
                __typename
                upc
              }
              ... on Book {
                __typename
                isbn
              }
            } =>
            {
              ... on Furniture {
                name
                cost: price
                details {
                  origin: country
                }
              }
              ... on Book {
                cost: price
                details {
                  origin: country
                }
              }
            }
          },
        },
      },
    },
  }
  """

Scenario: should properly expand nested unions with inline fragments
  Given query
  """
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
  """
  Then the query plan should be
  """
  QueryPlan {
    Fetch(service: "documents") {
      {
        body {
          __typename
          ... on Image {
            attributes {
              url
            }
          }
          ... on Text {
            attributes {
              bold
            }
          }
        }
      }
    },
  }
  """

Scenario: deduplicates fields / selections regardless of adjacency and type condition nesting for inline fragments
  Given query
  """
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
  """
  Then the query plan should be
  """
  QueryPlan {
    Fetch(service: "documents") {
      {
        body {
          __typename
          ... on Text {
            attributes {
              bold
              text
            }
          }
        }
      }
    },
  }
  """

Scenario: deduplicates fields / selections regardless of adjacency and type condition nesting for named fragment spreads
  Given query
  """
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
  """
  Then the query plan should be
  """
  QueryPlan {
    Fetch(service: "documents") {
      {
        body {
          __typename
          ... on Text {
            attributes {
              bold
              text
            }
          }
        }
      }
    },
  }
  """
