# Query Plan Tests

## Introduction

There are two files used to test the query plan builder:

1. [build-query-plan.feature](./build-query-plan.feature): Programming-language agnostic files written in a format called [Gherkin](https://cucumber.io/docs/gherkin/reference/) for [Cucumber](https://cucumber.io/).
2. [queryPlanCucumber.test.ts](./queryPlanCucumber.test.ts): The implementation which provides coverage for the Gherkin-specified behavior.

> If you're not familiar with Cucumber or BDD, check out [this video](https://youtu.be/lC0jzd8sGIA) for a great introduction to the concepts involved. Cucumber has test runners in multiple languages, allowing a test spec to be written in plain English and then individual implementations of the test suite can describe how they would like tests to be run for their specific implementation. For Java, Kotlin, Ruby, and JavaScript, Cucumber even has a [10-minute tutorial](https://cucumber.io/docs/guides/10-minute-tutorial/) to help get started.


## Scenarios

_Scenarios_ are Cucumber's test cases. Each scenario should contain the instructions for a single kind of test.

## Steps

Cucumber tests (scenarios) are made up of `steps`. Each step can be prefixed with a "`Given`", "`When`", or "`Then`" step, which when all provided, must occur in precisely that order. These stages represent test _preconditions_, test _execution_, and test _expectations_, respectively. However, tests don't _need_ all 3 of steps! Scenarios can leave off the `When` step when it's not needed. For example, query plan builder tests only have the "Given" and "Then" steps, like so:

```gherkin
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
  Then query plan
    """
    {
      "kind": "QueryPlan",
      "node": {
        "kind": "Fetch",
        "serviceName": "documents",
        "variableUsages": [],
        "operation": "{body{__typename ...on Image{attributes{url}}...on Text{attributes{bold text}}}}"
      }
    }
    """
```

There can be multiple of any kind of step using the `And` keyword. In the following example, there are 2 `Given` steps. One represented by the `Given` keyword itself, and another represented with the `And` keyword.

```
Given schema A
And schema extension B
Then composed schema should be ...
```

Using `And` is especially useful in `Then` steps for testing multiple kinds of expectations. For example, to create a test that looked at a query plan and expected that it called service A and _didn't_ call service B, the test spec would look like this:

```
Given service A, B
When querying
  """
  query { a }
  """
Then calls service A
And doesn't call service B
```

## Writing test integrations

Cucumber has a test runner for [many different languages](https://cucumber.io/docs/tools/related-tools/) and test frameworks including Java, Ruby, Rust, and many more. Usually, writing an integration for Cucumber looks similar though. You typically need to write instructions for what to with each kind of step. For example, in the example above where querying a service and expecting things of the query plan, we'd need to define 4 different kind of steps, typically with regex matchers (which are simplified here a bit):

1. `^service *`
2. `^querying`
3. `^calls *`
4. `^doesn't call *`

Using regex groups, we can extract whatever data we need from the test instructions. For the first pattern, we can use regex to get the service names we want to compose from the given list, and compose them based off a predetermined set of fixtures.

Gherkin (the language Cucumber tests are written in) has the idea of [arguments](https://cucumber.io/docs/gherkin/reference/#step-arguments) as well, which is what is used in the second step (the `querying...`) step. The query `query { a }` is referred to as an argument to that step, and each cucumber runner has a way of handling arguments, usually as an argument to the handling function.

In JavaScript, writing a function to handle the `querying` step would look something like this:

```JavaScript
when(/^querying$/im, (operation) => {
  result = execute(services, { query: gql(operation) });
});
```

It's common in Cucumber execution to keep arguments, variables, and other data globally available to each step. This is either done by a variable scoped above the execution of the steps like in the JavaScript example above or as a mutable "context" passed to each step executor function. This just depends on the language you're working with. The reason this pattern is used is that all steps often need similar data. For example, the `querying` step we defined above needs to know what services are being composed from the `Given` step above to actually execute the operation, and the `Then` steps to follow need to access the execution's result data.
