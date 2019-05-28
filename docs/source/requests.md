---
title: POST and GET format
description: How to send requests to Apollo Server over HTTP.
---

Apollo Server accepts both GET and POST requests.

## POST requests

Apollo Server accepts POST requests with a JSON body. A valid request must contain either a `query` or an `operationName` (or both, in case of a named query), and may include `variables.` Here's an example for a valid body of a post request:

```js
{
  "query": "query aTest($arg1: String!) { test(who: $arg1) }",
  "operationName": "aTest",
  "variables": { "arg1": "me" }
}
```

Variables can be an object or a JSON-encoded string. I.e. the following is equivalent to the previous query:

```js
{
  "query": "query aTest($arg1: String!) { test(who: $arg1) }",
  "operationName": "aTest",
  "variables": "{ \"arg1\": \"me\" }"
}
```

### Batching

A batch of queries can be sent by simply sending a JSON-encoded array of queries, e.g.

```js
[{ query: '{ testString }' }, { query: 'query q2{ test(who: "you" ) }' }];
```

If a batch of queries is sent, the response will be an array of GraphQL responses.

If Apollo Server is running under a different origin than your client, you will need to enable CORS support on the server, or proxy the GraphQL requests through a web server under the main origin.

## GET requests

Apollo Server also accepts GET requests. A GET request must pass query and optionally variables and operationName in the URL.

Here is the same query from above in a well-formatted GET request to Apollo Server:

```
GET /graphql?query=query%20aTest(%24arg1%3A%20String!)%20%7B%20test(who%3A%20%24arg1)%20%7D&operationName=aTest&variables=me
```

caveat: Mutations cannot be executed via GET requests.
