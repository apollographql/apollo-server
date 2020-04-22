---
title: Federation error codes
sidebar_title: Error codes
---

When Apollo Gateway attempts to **compose** the schemas provided by your implementing services into a _single_ schema, it confirms that:

* The resulting schema is valid
* The gateway has all of the information it needs to execute operations against the resulting schema

If Apollo Gateway encounters an error, composition fails. This document lists composition error codes and their root causes.

## `extend`

| Code | Description |
|---|---|
| `EXTENSION_OF_WRONG_KIND`  | An implementing service is attempting to `extend` another service's type, but there is a declaration mismatch. For example, `extend interface MyType` is invalid if `MyType` is not defined as an `interface` in its originating service. |
| `EXTENSION_WITH_NO_BASE` | An implementing service is attempting to `extend` a type that is not originally defined in any known service. |

## `@key`

| Code | Description |
|---|---|
| `KEY_FIELDS_SELECT_INVALID_TYPE`  | The `fields` argument of an entity's `@key` includes at least one root field that results in a list, interface, or union type. Root fields of these types cannot be part of a `@key`. |
| `KEY_FIELDS_MISSING_ON_BASE` | The `fields` argument of an entity's `@key` includes at least one field that's also defined in another service. Each field of an entity should be defined in exactly one service. |
| `KEY_FIELDS_MISSING_EXTERNAL` | An implementing service is attempting to `extend` another service's entity, but its `@key` includes at least one field that is not marked as `@external`. |

## `@external`

| Code | Description |
|---|---|
| `EXTERNAL_UNUSED` | An `@external` entity field is not being used by any instance of `@key`, `@requires`, or `@provides`. |
| `EXTERNAL_TYPE_MISMATCH` | An `@external` entity field does not match the type of the declaration in the entity's originating service. |
| `EXTERNAL_MISSING_ON_BASE` | An entity field marked as `@external` is not defined in the entity's originating service. |
| `EXTERNAL_USED_ON_BASE` | An entity field is marked as `@external` in the entity's originating service, which is invalid. |

## `@provides`

| Code | Description |
|---|---|
| `PROVIDES_FIELDS_MISSING_EXTERNAL` | The `fields` argument of an entity field's `@provides` directive includes a field that is not marked as `@external`. |
| `PROVIDES_NOT_ON_ENTITY` | The `@provides` directive is being applied to a type that is not an entity. |
| `PROVIDES_FIELDS_SELECT_INVALID_TYPE` | The `fields` argument of an entity field's `@provides` directive includes at least one root field that results in a list or interface. Root fields of these types cannot be included in `@provides`. |

## `@requires`

| Code | Description |
|---|---|
| `REQUIRES_FIELDS_MISSING_EXTERNAL` | The `fields` argument of an entity field's `@requires` directive includes a field that is not marked as `@external`. |
| `REQUIRES_FIELDS_MISSING_ON_BASE` | The `fields` argument of an entity field's `@requires` directive includes a field that is not defined in the entity's originating service.`|
| `REQUIRES_USED_ON_BASE` | An entity field is marked with `@requires` in the entity's originating service, which is invalid. |

## Custom directives

| Code | Description |
|---|---|
| `EXECUTABLE_DIRECTIVES_IN_ALL_SERVICES` | A custom directive is not defined in an implementing service. All custom directives must be defined across all implementing services, even if some of those definitions are a no-op. |
| `EXECUTABLE_DIRECTIVES_IDENTICAL` | <p>A custom directive is defined inconsistently across services. A directive's arguments and argument types, along with its supported schema locations, must match across all services.</p> Only [`ExecutableDirectiveLocation`](https://graphql.github.io/graphql-spec/June2018/#ExecutableDirectiveLocation)s are compared. [`TypeSystemDirectiveLocation`](https://graphql.github.io/graphql-spec/June2018/#TypeSystemDirectiveLocation)s are ignored during composition. |

## Enums and scalars

| Code | Description |
|---|---|
| `DUPLICATE_SCALAR_DEFINITION` | A scalar type is defined multiple times in a single service.|
| `DUPLICATE_ENUM_DEFINITION` | An enum type is defined multiple times in a single service.|
| `DUPLICATE_ENUM_VALUE` | One of an enum type's values is defined multiple times. Duplicate values can be in either the enum's originating service or another service that extends the enum. |
| `ENUM_MISMATCH` | <p>An enum's values do not match across all services. Even if a service does not use all enum values, they still must be provided if another service uses them.</p>This error lists which services have matching definitions. For example, `[serviceA, serviceB], [serviceC]` indicates that `serviceA` and `serviceB` have matching enum definitions, but `serviceC` does not match the other definitions. |
| `ENUM_MISMATCH_TYPE` | An enum is defined with the same name as a non-enum type in another service. |

## Root fields

| Code | Description |
|---|---|
| `RESERVED_FIELD_USED` | An implementing service defines a field name that is reserved by Apollo Federation, such as `Query._service` or `Query._entities`. |
| `ROOT_QUERY_USED` | An implementing service's schema defines a type with the name `Query`, while also specifying a _different_ type name as the root query object. This is not allowed. |
| `ROOT_MUTATION_USED` | An implementing service's schema defines a type with the name `Mutation`, while also specifying a _different_ type name as the root mutation object. This is not allowed. |
| `ROOT_SUBSCRIPTION_USED` | An implementing service's schema defines a type with the name `Subscription`, while also specifying a _different_ type name as the root subscription object. This is not allowed. |

## Value types

| Code | Description |
|---|---|
| `VALUE_TYPE_FIELD_TYPE_MISMATCH` | Multiple implementing services define the same value type, but with mismatched fields. Value types must match across all services that define them. |
| `VALUE_TYPE_NO_ENTITY` | Multiple implementing services define the same value type, but at least one service assigns it a `@key`. Either remove the `@key` or convert the type to an entity and `extend` it.|
| `VALUE_TYPE_UNION_TYPES_MISMATCH` | Multiple implementing services define the same union type, but with mismatched sets of types. Union types must match across all services that define them. |
| `VALUE_TYPE_KIND_MISMATCH` | An implementing service defines a type with the same name and fields as a type in another service, but there is a declaration mismatch. For example, `type MyType` is invalid if another service defines `interface MyType`. |

## Modified SDL validations

| Code | Description |
|---|---|
| Unique type names | Type definitions cannot be duplicated across services, with the exception of enums, scalars, and [value types](/federation/value-types/). This is a modified version of the `graphql-js` validation with exclusions for enums and scalars, because those are required to be duplicated across services. |
