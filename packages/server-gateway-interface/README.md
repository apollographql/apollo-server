# Apollo Server/Gateway interface

This package defines TypeScript types for the interface between Apollo Server and Apollo Gateway. It contains no runtime code.

The types in this package describe the API as of Gateway 0.35.0 (ie, with onSchemaLoadOrUpdate). It is extracted from the Apollo Server 3 `apollo-server-types` package. Most of the type names have been changed to start with `Gateway`, so that they coexist better with similarly-named types. (Because TypeScript is generally structurally typed, this is OK.)

Note that the cache scope field (eg, on `requestContext.overallCachePolicy.scope`) is defined as `any` in this package. That's because in AS3 this type is an enum, and enums in TypeScript are _not_ structurally typed. So we can't actually create an object of this type without depending on AS3 (or updating AS3 to get its definition from somewhere shared).

We have updated `@apollo/gateway` (v0 and v2) to define its types from this package rather than `apollo-server-types`. This allows Gateway to be compatible with both AS3 and AS4 (and even AS2, for Gateway 0.x) without needing to pull either package's code into the TypeScript build.

Apollo Server 4 directly depends on this package and uses its types to construct its calls to the Gateway.
