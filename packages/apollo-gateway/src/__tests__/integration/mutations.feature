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
{}
"""
