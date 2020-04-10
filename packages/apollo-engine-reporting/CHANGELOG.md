# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.8.0-alpha.0](https://github.com/apollographql/apollo-engine-reporting/compare/apollo-engine-reporting@1.7.1...apollo-engine-reporting@1.8.0-alpha.0) (2020-04-10)

**Note:** Version bump only for package apollo-engine-reporting





### vNext

# v1.0.0

* The signature functions which were previously exported from this package's
  main module have been removed from `apollo-engine-reporting` and
  moved to the `apollo-graphql` package.  They should be more universally
  helpful in that library, and should avoid tooling which needs to use them
  from needing to bring in all of `apollo-server-core`.
