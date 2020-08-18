Feature: Query Planning > Single Service

# I don't think we need to move this test -- looks way too simple, maybe an
# early-written test?
# Scenario: executes a query plan over concrete types

# this test looks a bit deceiving -- this is the correct query plan, but when
# executed, __typename should be returned
Scenario: does not remove __typename on root types
  Given query
  """
  query GetUser {
    __typename
  }
  """
  Then query plan
  """
  {"kind":"QueryPlan"}
  """

Scenario: does not remove __typename if that is all that is requested on an entity
  Given query
  """
  query GetUser {
    me {
      __typename
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
      "operation": "{me{__typename}}"
    }
  }
  """

Scenario: does not remove __typename if that is all that is requested on a value type
  Given query
  """
  query GetUser {
    me {
      account {
        __typename
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
      "operation": "{me{account{__typename}}}"
    }
  }
  """
