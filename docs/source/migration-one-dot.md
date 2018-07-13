---
title: Migrating to v1.0
description: How to migrate to Apollo Server 1.0
---

In July of 2017, we [announced the release of Apollo Server 1.0](https://blog.apollographql.com/apollo-server-1-0-a-graphql-server-for-all-node-js-frameworks-2b37d3342f7c). This was not a major change, except for one thing: All of the packages have been renamed from `graphql-server-*` to `apollo-server-*`.

All of the options, names, and API are identical to pre-1.0 versions.

So, if before you were doing:

```js
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
```

Now, you should do:

```js
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
```

We made this change because it was consistent with how developers in the community were referring to the package. With the `graphql-server` name, we wanted to emphasize that this package works with any GraphQL technology, but people called it "Apollo Server" anyway, so we decided that was a good name to use officially as well.
