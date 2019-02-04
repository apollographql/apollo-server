### vNext

# v1.0.0

* The signature functions which were previously exported from this package's
  main module have been removed from `apollo-engine-reporting` and
  moved to the `apollo-graphql` package.  They should be more universally
  helpful in that library, and should avoid tooling which needs to use them
  from needing to bring in all of `apollo-server-core`.

