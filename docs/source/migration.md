---
title: Migrating to v3.0
description: How to migrate to Apollo Server 3.0
---

### File uploads

1. Install `graphql-upload`

       npm install graphql-upload

2. Import the necessary primitives from `graphql-upload`

   ```javascript
   import { GraphQLUpload, graphqlUploadExpress } from 'graphql-upload';
   ```

3. Add the `Upload` scalar to the schema

   ```graphql
   scalar Upload
   ```

4. Add a resolver for the `Upload` scalar

   ```javascript
   const resolvers = {
     // Add this line to use the `GraphQLUpload` from `graphql-upload`.
     Upload: GraphQLUpload,

     /*
	...
	Other resolvers remain the same.
	...
     */

   },
   ```

5. Add the `graphql-upload` middleware

   Add the `graphqlUploadExpress` middleware _before_ calling into
   the `applyMiddleware` method with the `app`.

   ```js
   const app = express(); // Existing.
   app.use(graphqlUploadExpress()); // New!
   server.applyMiddleware({ app }); // Existing.
   ```
