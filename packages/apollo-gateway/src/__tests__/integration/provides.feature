Feature: provides directive

  Scenario: does not have to go to another service when field is given
    Given federated accounts, books, inventory, product, reviews services
    When I execute
      """
      query GetReviewers {
        topReviews {
          author {
            username
          }
        }
      }
      """
    Then the reviews service should be called
    And the accounts service should not be called
    And the response should be
      """
      {
        "data": {
          "topReviews": [
            { "author": { "username": "@ada" } },
            { "author": { "username": "@ada" } },
            { "author": { "username": "@complete" } },
            { "author": { "username": "@complete" } },
            { "author": { "username": "@complete" } }
          ]
        }
      }
      """

  Scenario: does not load fields provided even when going to other service
    Given federated accounts, books, inventory, product, reviews services
    When I execute
      """
        query GetReviewers {
          topReviews {
            author {
              username
              name
            }
          }
        }
      """
    Then the accounts, reviews services should be called
    And the response should be
      """
      {
        "data": {
          "topReviews": [
            { "author": { "username": "@ada", "name": "Ada Lovelace" } },
            { "author": { "username": "@ada", "name": "Ada Lovelace" } },
            { "author": { "username": "@complete", "name": "Alan Turing" } },
            { "author": { "username": "@complete", "name": "Alan Turing" } },
            { "author": { "username": "@complete", "name": "Alan Turing" } }
          ]
        }
      }
      """
