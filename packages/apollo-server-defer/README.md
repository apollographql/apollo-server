## Proposal to add @defer support in Apollo

### Motivation

When loading data-heavy pages, we want to minimize the time to interactivity (TTI) in order to provide a snappy user experience. In many applications, we want TTI to be much shorter than how long the page would take to load completely - motivating the need for “above the fold” optimizations.

In the world of REST APIs, a common solution is to make two separate requests to the server. The first loads minimal data to provide an initial render, and a second to load the rest of the data.

In GraphQL/Apollo Client, using that same approach leads to the same developer overhead:

- Figuring out how to chop up your query into different pieces and wrapping them with multiple query components
- Sharing data between queries may be problematic (e.g. secondary queries might depend on some data returned from the first query)
- Breaking up queries like this just doesn't feel like the smooth GraphQL experience we want 😢

### A Better Way

_@defer_ provides a way for us to mark fields in our schema to _not_ wait on, because they might be:

- _Expensive to load_. This includes private data that is not cached (like user progress), or information that requires more computation on the backend (like calculating price quotes on Airbnb)
- _Not on the critical path for interactivity._ This includes loading the comments section of a blog post, or the number of claps received.
- _Expensive to send._ Even if the field may resolve quickly (ready in memory), users might still choose to defer it if the cost of transport is too expensive.

This approach has been used internally at Facebook (see [Lee Byron's 2016 talk](https://youtu.be/ViXL0YQnioU?t=9m4s)), and the concept had generated alot of interest within the GraphQL community since. But until now, there was no way for people to actually use it. 

At Apollo, we are committed to providing the best developer experience throughout your GraphQL journey. With Apollo Server and Client, we see this as a unique opportunity to bake in first class support for advanced features like @defer. 

### Use Cases

```graphql
type Video {
  # public data that can be cached
  id: ID!
  title: String
  description: String
  # progress is private to the user, and significantly more
  # expensive to retrieve
  progress: Progress
  comments: [Comment]
}

type Progress {
  percent: Float
  position: Float
}

type Comment {
  userId: ID!
  text: String
}

# Example Query using @defer
query {
  video(id: $id) {
    title: String
    progress @defer {
      percent
      position
    }
    comments @defer {
      userId
      text
    }
  }
}
```

Instead of holding back the GraphQL response until the entire query is resolved, @defer tells Apollo Server to return a partial query response ahead of time. In the example above, we see how it may be used to remove `progress` and `comments` from the intial query response. Apollo Server would then take care of resolving the rest of the deferred fields in the background, and stream them to the client when they are ready.

```
// Initial Response
{
  "data": {
    "asset": {
      "title": "Westworld",
    }
  }
}

// Stream in deferred fields as patches
{
  "path": ["video", "progress"],
  "data": {
    "percent": 20,
    "position": 20
  }
}
{
  "path": ["video", "comments"],
  "data": [{
    "userId": "123",
    "text": "..."
  }]
}
```

### Why is @defer an ideal solution?

- Query remains super easy to read 👍
- Stays true to Apollo's declarative approach to data loading - everything is encapsulated in a single query component 😎
- Greatly reduces boilerplate code to manage multiple requests, a huge value-add for users that use both Apollo Server AND Client together.

## Implementation Details

### Patch Data Format:

- Proposed format for `ExecutionPatchResult`
  ```graphql
  {
    path: [string]!
    data: {}
    errors: []
  }
  ```
- We should use the same patch format for @defer/stream/live support.

### Apollo Server:

In order to support @defer, there are significant changes to be made to the execution phase of GraphQL.

- Extending graphql-js execution to support deferred responses.
- Defining a new response type that wraps the initial response and an asynchronous stream of patches. 
- Maximize code reuse by exporting types and utility functions from graphql.js, making a PR if necessary.
- Restrict peer dependency on graphql.js to versions that we have tested with.

### Apollo Client:

- Should contain the logic to merge patches in and update the UI as data gets streamed in. 
- Initial implementation of @defer support should come as a Apollo Link. Reads from a socket connection or some other event stream, keeps the partial response in memory, merging patches as they come and pushing it through the link stack.

### Errors:

This refers specifically to the errors that occur when streaming deferred fields. Errors on the initial response will be handled as per normal.

- Resolver level errors can be sent along with the patch. These will be merged with the errors array to create the full response.
- Network errors (i.e when the websocket connection is broken). Ideally, a network error should not nullify the results that have already been sent succesfully. However, the client should expose the network status to indicate whether all the patches have been sent successfully.  

### Transport:

- Upgrading `HttpLink` to accept multipart http responses from `apollo-server-express`. This is the default solution, since it is lightweight compared to websockets, and requires no additional set up from the user. Note that we are using the ReadableStream API, which is available on most modern browsers. 
- In the future, we should be able to support any transport that can stream or push data to the client, like websockets or server side events. If the transport layer does not support this, Apollo Server may fall back to normal execution and ignore @defer, while providing a warning message on the console. 
- Note: Deferred queries are not able to be refetched in isolation. So links like apollo-link-retry and apollo-link-error might need to ignore patches for now.

### Restrictions on @defer usage:

- _Mutations:_ Not supported yet. Would love to hear if there are any usecases for this!

- _Non-Nullable Types_: Not allowed and will throw an error. Deferring non-nullable types may lead to unexpected behavior when errors occur, since errors will propagate up to the nearest nullable parent as per the GraphQL spec. We want to avoid letting errors on deferred fields clobber the initial data that was loaded already.

- _Nesting_: @defer can be nested arbitrarily. For example, we can defer a list type, and defer a field on an object in the list. We ensure that the patch for a parent field will be sent before a child field, even if the child object resolves first. This will simplify the logic for merging patches.

- _@defer should apply regardless of data availability_

  - Even if the deferred fields are available in memory immediately, it should not be sent with the initial response.

    ```
    // For example, even if the entire "asset" is queried from
    // the database as a single object, we still defer sending
    // the "reviews" field
    query {
      asset {
        id
        title
        reviews @defer
      }
    }
    ```

  - The reason that this behavior is useful is because some fields can incur high bandwidth to transfer, slowing down initial load.
  - We could allow the user to control this behavior, by taking an optional waitFor argument:
    ```
    query {
      asset {
        id
        title
        reviews @defer(waitFor: 0) # always defer and send multiple responses
        related @defer(waitFor: 200) # if we can get the data within 200ms, send just one response
      }
    }
    ```
- _Performance considerations_: If @defer is used too granularly, the overhead of performing patching and re-rendering could be worse than just waiting for the full data response. 

## Open PRs
- [`apollo-server`](https://github.com/apollographql/apollo-server/pull/1287)
- [`apollo-link`](https://github.com/apollographql/apollo-link/pull/714)
- [`apollo-client`](https://github.com/apollographql/apollo-client/pull/3686)
- [`react-apollo`](https://github.com/apollographql/react-apollo/pull/2192)
