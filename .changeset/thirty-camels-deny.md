---
'@apollo/server': minor
---

⚠️ SECURITY `@apollo/server/standalone`:

The default configuration of `startStandaloneServer` was vulnerable to denial of service (DoS) attacks through specially crafted request bodies with exotic character set encodings.

In accordance with [RFC 7159](https://datatracker.ietf.org/doc/html/rfc7159#section-8.1), we now only accept request bodies encoded in UTF-8, UTF-16 (LE or BE), or UTF-32 (LE or BE).
Any other character set will be rejected with a `415 Unsupported Media Type` error.
Note that the more recent JSON RFC, [RFC 8259](https://datatracker.ietf.org/doc/html/rfc8259#section-8.1), is more strict and will only allow UTF-8.
Since this is a minor release, we have chosen to remain compatible with the more permissive RFC 7159 for now.
In a future major release, we may tighten this restriction further to only allow UTF-8.

**If you were not using `startStandaloneServer`, you were not affected by this vulnerability.**

Generally, please note that we provide `startStandaloneServer` as a convenience tool for quickly getting started with Apollo Server.
For production deployments, we recommend using Apollo Server with a more fully-featured web server framework such as Express, Koa, or Fastify, where you have more control over security-related configuration options.
