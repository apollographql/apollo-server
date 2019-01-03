---
title: Spec for @defer Directive
---

## Spec for @defer Directive

Apollo Server supports the `@defer` directive out of the box, allowing declarative control of when individual fields in a single GraphQL query get fulfilled and sent to the client. The GraphQL execution phase does not wait for deferred fields to resolve, instead returning `null` as a placeholder, and sending patches to the client as those fields get resolved asynchronously.

This document describes the implementation of `@defer` support in Apollo Server, and how it interoperates with Apollo Client.

## The `@defer` Directive

This is how the directive is defined using GraphQL DSL:

```graphql
directive @defer(if: Boolean = true) on FIELD
```

The built-in `@include` and `@skip` directives should take precedence over `@defer`.

In Apollo Server, `@defer` is defined by default, so the user does not have to add it to their schema to use it.

### Caveats regarding `@defer` usage

- Mutations: Not supported. Would love to hear from the community if there are any use cases for this.

- Non-Nullable Types: Not allowed and should throw a GraphQL validation error. This is because deferred fields are returned as `null` in the initial response, and we want deferred queries to work with existing type generation tools. Deferring non-nullable types may also lead to unexpected behavior when errors occur, since errors will propagate up to the nearest nullable parent as per the GraphQL spec. We want to avoid letting errors on deferred fields clobber the initial data that was loaded already.

- Nesting: `@defer` can be nested arbitrarily. For example, we can defer a list type, and defer a field on an object in the list. During execution, we ensure that the patch for a parent field will be sent before its children, even if the child object resolves first. This will simplify the logic for merging patches.

### Runtime Behavior
- In our implementation, we did not suspend executing the resolver functions of deferred fields, but rather, chose not to wait on them before sending early results to the client. This decision was made with the assumption that resolvers spend most of its time waiting on I/O, rather than actual computation. However, implementors may choose either approach.

- `@defer` should apply regardless of data availability. Even if the deferred fields are available in memory immediately, it should not be sent with the initial response. For example, even if the entire `Story` object is queried from the database as a single object, we still defer sending the `comments` field. The reason that this behavior is useful is because some fields can incur high bandwidth to transfer, slowing down initial load.

- Resolver level errors are returned in the `errors` field of its **nearest deferred parent**. For example, if the `text` field on `comments` throws an resolver error, it gets sent with the patch for `comments`, rather than with the initial response.
    ```graphql
    query {
      newsFeed {
        stories {
          text
          comments @defer {
            text <- throws error
          }
        }
      }
    }
    ```
    These errors will be merged in the `graphQLErrors` array on Apollo Client.

 - If there are multiple declarations of a field within the query, **all** of them have to contain `@defer` for the field to be deferred. This could happen if we have use a fragment like this:
    ```graphql
    fragment StoryDetail on Story {
      id
      text
    }
    query {
      newsFeed {
        stories {
          text @defer
          ...StoryDetail
        }
      }
    }
    ```
    In this case, `text` will not be deferred since `@defer` was not applied in the fragment definition.

    A common pattern around fragments is to bind it to a component and reuse them across different parts of your UI. This is why it would be ideal to make sure that the `@defer` behavior of fields in a fragment is not overridden.

## Transport

To provide the easiest upgrade path for a majority of users using Apollo Client, we opted for using Multipart HTTP as the default transport. This is more lightweight than other streaming methods like websockets, with no additional overhead for clients that do not send queries with `@defer`.

One drawback of using Multipart HTTP is that there is generally a finite browser timeout for a pending request. This is usually not an issue for `@defer`'s intended use case, but if there is a need to use `@defer` on long-lived requests, a different transport is required.

We are working on refactoring the request pipeline in Apollo Server to make it easier to add support for other transport modules.

## Apollo Server Variants
In order to support `@defer`, Apollo Server variants like Koa, Hapi etc must explicitly support and enable it. This is done by passing in an `enableDefer` flag to `runHttpQuery`. For illustration, this is how it looks like on `apollo-server-express`. Without this flag, the `@defer` directive will be ignored.

```typescript
const graphqlHandler = async (
    req: express.Request,
    res: express.Response,
    next,
  ) => {
    const a = runHttpQuery([req, res], {
      method: req.method,
      options: options,
      query: req.method === 'POST' ? req.body : req.query,
      request: convertNodeHttpToRequest(req),
      enableDefer: true,
    }).then(() => {})
  }
```

## Response Specification

Apollo Client is able to read from a Multipart HTTP response stream (using `apollo-link-http`) and merge patches with the intial payload.

```graphql
{
  query {
    newsFeed {
      stories {
        id
        text
        comments {
          text
        }
      }
      recommendedForYou {
        story {
          id
          text
        }
        matchScore
      }
    }
  }
}
```

For the sample query above, Apollo Client expects a response following this specification.

- The HTTP response should adhere to the [HTTP Multipart Content-Type](https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html) format.

- Each part of the multipart response should have `Content-Type` set to `application/json`. `Content-Length` should also be set for each part.

- Since the body of each part is JSON, it is safe to use `-` as the simplest boundary for each part. Therefore, each delimiter looks like `\r\n---\r\n` and the terminating delimiter looks like `\r\n-----\r\n`.

- The first part of the multipart response should contain the requested data, with the values of the deferred fields set to `null`. It looks like a typical GraphQL response.

  ```
  {
    data?: {}
    errors?: [GraphQLError]
  }
  ```

- Subsequent parts should contain patches that have the following fields:
  ```
  {
    path: [string | number]
    data?: {}
    errors?: [GraphQLError]
  }
  ```
  where `path` is the path to the field where the patch should be merged with the initial response.
- The server should ensure that patches are ordered according to its hierachy in the data tree. A patch for a deferred field that is a parent of other deferred fields should come first.

- The server should write data/patches to the response stream as soon as it is ready.

- Sample HTTP Multipart Response

  ```
  HTTP/1.1 200 OK
  Connection: keep-alive
  Content-Type: multipart/mixed; boundary="-"
  Transfer-Encoding: chunked


  ---
  Content-Type: application/json
  Content-Length: 999

  {
    "data": {
        "newsFeed": {
            "stories": [
                {"id":"1","text":"Breaking news: Apollo Project lands first human on the moon","comments":null},
                {"id":"2","text":"China's super-sized space plans may involve help from Russia","comments":null},
                {"id":"3","text":"Astronauts' snapshots from space light up the Twitterverse","comments":null}
            ],
        "recommendedForYou":null
      }
    }
  }

  ---
  Content-Type: application/json
  Content-Length: 999

  {
    "path":["newsFeed","stories",0,"comments"],
    "data":[{"text":"Wow! Incredible stuff!"},{"text":"This is awesome!"}]
  }

  ---
  Content-Type: application/json
  Content-Length: 999

  {
    "path":["newsFeed","stories",1,"comments"],
    "data":[{"text":"Fake news!"},{"text":"This is awesome!"}]
  }

  ---
  Content-Type: application/json
  Content-Length: 999

  {
    "path":["newsFeed","stories",2,"comments"],
    "data":[{"text":"Unbelievable!"},{"text":"Wow! Incredible stuff!"}]
  }

  ---
  Content-Type: application/json
  Content-Length: 999

  {
    "path":["newsFeed","recommendedForYou"],
    "data":[
      {
        "story":{"id":"4","text":"Young Star May Be Devouring a Planet"},
        "matchScore":89
      },
      {
        "story":{"id":"5","text":"Watch Astronauts Set Foot on the Moon in Historic NASA Footage"},
        "matchScore":92
      }
    ]
  }

  -----
  ```

## Other ideas

These are features that may be nice to have that are not implemented in Apollo Server.

- Having fields stream in continuously and cause a re-render may result in reflow or "UI jankyness". One way to manage this is to take an optional `waitFor` argument:
  ```
  query {
    asset {
      title
      # Always defer and send multiple responses
      reviews @defer(waitFor: 0)
      # If we can get the data within 200ms, send just one response
      related @defer(waitFor: 200)
    }
  }
  ```
  This could have potentially nice tie-ins with React Suspense.

- It may also make sense to batch or throttle when updates are pushed through to the UI.