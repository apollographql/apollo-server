---
title: Understanding errors
description: Rules for schema composition
---
Apollo Federation implements a strict composition model. When building a gateway using the `@apollo/gateway` package, `gateway.load()` validates that the provided services compose into a valid GraphQL schema **and** that the gateway has all of the information it needs to execute operations against the composed schema. Any errors will fail composition. This section documents the composition errors that can be thrown by `gateway.load()`.

### `@key` directives

- `KEY_FIELDS_SELECT_INVALID_TYPE`: The fields argument can not have root fields that result in a list, interface, or union type.
- `KEY_FIELDS_MISSING_ON_BASE`: the fields argument can not select fields that were overwritten by another service.
- `KEY_FIELDS_MISSING_EXTERNAL`: On extended types, keys must reference a field marked as `@external`.

### `@external` directives

- `EXTERNAL_UNUSED`: For every `@external` field, there should be at least one `@requires`, `@provides`, or `@key` directive that references it.
- `EXTERNAL_TYPE_MISMATCH`: All fields marked with `@external` must match the type definition of the base service.
- `EXTERNAL_MISSING_ON_BASE`: All fields marked with `@external` must exist on the base type.
- `EXTERNAL_USED_ON_BASE`: There should be no fields with `@external` on base type definitions.

### `@provides` directives

- `PROVIDES_FIELDS_MISSING_EXTERNAL`: The fields argument can only use fields marked as `@external` on types from external services. These external types and fields must be included in the service for validation.
- `PROVIDES_NOT_ON_ENTITY`: The provides directive can only be used on fields that return a type that has a `@key`.
- `PROVIDES_FIELDS_SELECT_INVALID_TYPE`: The fields argument can not reference fields that result in a list or interface.

### `@requires` directives

- `REQUIRES_FIELDS_MISSING_EXTERNAL`: For every field in a `@requires` selection, there must be a matching `@external` field in the service.
- `REQUIRES_FIELDS_MISSING_ON_BASE`: The fields arg in `@requires` can only reference fields on the base type.
- `REQUIRES_USED_ON_BASE`: The requires directive may not be used on fields defined on a base type.

### Root Fields

- `RESERVED_FIELD_USED`: The `Query._service` and `Query._entities` fields are reserved.
- `ROOT_QUERY_USED`: `Query` is disallowed when a schema definition or extension is provided.
- `ROOT_MUTATION_USED`: `Mutation` is disallowed when a schema definition or extension is provided.
- `ROOT_SUBSCRIPTION_USED`: `Subscription` is disallowed when a schema definition or extension is provided.
