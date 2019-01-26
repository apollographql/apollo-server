# Changelog

> **A note on ommitted versions**: Due to the way that the Apollo Server
> monorepo releases occur (via Lerna with _exact_ version pinning), the
> version of the `apollo-cache-control` package is sometimes bumped and
> published despite having no functional changes in its behavior.  We will
> always attempt to specifically mention functional changes to the
> `apollo-cache-control` package within this particular `CHANGELOG.md`.

### v0.4.1

* Fix cache hints of `maxAge: 0` to mean "uncachable". (#2197)
* Apply `defaultMaxAge` to scalar fields on the root object. (#2210)

### v0.3.0

* Support calculating Cache-Control HTTP headers when used by `apollo-server@2.0.0`.

### v0.2.0

Moved to the `apollo-server` git repository. No code changes.  (There are a
number of other 0.2.x releases with no code changes due to how the
`apollo-server` release process works.)

### v0.1.1

* Fix `defaultMaxAge` feature (introduced in 0.1.0) so that `maxAge: 0` overrides the default, as previously documented.

### v0.1.0

* **New feature**: New `defaultMaxAge` constructor option. (`apollo-server-*` will be updated to allow you to pass constructor options to the extension.)


### v0.0.10

* Update peer dependencies to support `graphql@0.13`.
* Expose `context.cacheControl.cacheHint` to resolvers.

(Older versions exist but have no CHANGELOG entries.)
