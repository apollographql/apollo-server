---
'@apollo/server': minor
---

⚠️ SECURITY `@apollo/server/standalone`:

The default configuration of `startStandaloneServer` was vulnerable to denial of service (DoS) attacks through specially crafted request bodies with exotic character set encodings.

In accordance with [RFC 7159](https://datatracker.ietf.org/doc/html/rfc7159#section-8.1), we now only accept request bodies encoded in UTF-8, UTF-16 (LE or BE), or UTF-32 (LE or BE).
Any other character set will be rejected with a `415 Unsupported Media Type` error.
Additionally, upstream libraries used by this version of Apollo Server may not support all of these encodings, so some requests may still fail even if they pass this check.

**If you were not using `startStandaloneServer`, you were not affected by this vulnerability.**

Generally, please note that we provide `startStandaloneServer` as a convenience tool for quickly getting started with Apollo Server.
For production deployments, we recommend using Apollo Server with a more fully-featured web server framework such as Express, Koa, or Fastify, where you have more control over security-related configuration options.

Also please note that **Apollo Server 4.x is considered EOL as of January 26, 2026, and Apollo no longer commits to providing support or updates for it**. Please prioritize migrating to Apollo Server 5.x for continued support and updates.
