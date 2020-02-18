---
title: Federation error codes
sidebar_title: Error codes
---

Apollo Federation implements a strict composition model. When building a gateway using the `@apollo/gateway` package, `ApolloServer` validates that the provided services compose into a valid GraphQL schema **and** that the gateway has all of the information it needs to execute operations against the composed schema. Any errors will fail composition. This section documents the composition errors that can be thrown by the `new ApolloServer()` call.

### Extending types

| Code | Description |
|---|---|
| `EXTENSION_OF_WRONG_KIND`  | An implementing service is attempting to `extend` another service's type, but there is a declaration mismatch. For example, `extend interface MyType` is invalid if `MyType` is not defined as an `interface` in its originating service. |
| `EXTENSION_WITH_NO_BASE` | An implementing service is attempting to `extend` a type that is not originally defined in any known service. |

### The `@key` directive

| Code | Description |
|---|---|
| `KEY_FIELDS_SELECT_INVALID_TYPE`  | The `fields` argument of an entity's `@key` includes at least one root field that results in a list, interface, or union type. Root fields of these types cannot be part of a `@key`. |
| `KEY_FIELDS_MISSING_ON_BASE` | The `fields` argument of an entity's `@key` includes at least one field that's also defined in another service. Each field of an entity should be defined in exactly one service. |
| `KEY_FIELDS_MISSING_EXTERNAL` | An implementing service is attempting to `extend` another service's entity, but its `@key` includes at least one field that is not marked as `@external`. |

### The `@external` directive

| Code | Description |
|---|---|
| `EXTERNAL_UNUSED` | An `@external` entity field is not currently being used by any instance of `@key`, `@requires`, or `@provides`. |
| `EXTERNAL_TYPE_MISMATCH` | An `@external` entity field does not match the type of the declaration in the entity's originating service. |
| `EXTERNAL_MISSING_ON_BASE` | An entity field marked as `@external` is not defined in the entity's originating service. |
| `EXTERNAL_USED_ON_BASE` | An entity field is marked as `@external` in the entity's originating service, which is invalid. |

### The `@provides` directive

| Code | Description |
|---|---|
| `PROVIDES_FIELDS_MISSING_EXTERNAL` | The `fields` argument of an entity field's `@provides` directive includes a field that is not marked as `@external`. |
| `PROVIDES_NOT_ON_ENTITY` | The `@provides` directive is being applied to a type that is not an entity. |
| `PROVIDES_FIELDS_SELECT_INVALID_TYPE` | The `fields` argument of an entity field's `@provides` directive includes at least one root field that results in a list or interface. Root fields of these types cannot be included in `@provides`. |

### `@requires` directives

- `REQUIRES_FIELDS_MISSING_EXTERNAL`: For every field in a `@requires` selection, there must be a matching `@external` field in the service.
- `REQUIRES_FIELDS_MISSING_ON_BASE`: The fields arg in `@requires` can only reference fields on the base type.
- `REQUIRES_USED_ON_BASE`: The requires directive can not be used on fields defined on a base type.

### Custom directives

- `EXECUTABLE_DIRECTIVES_IN_ALL_SERVICES`: Custom directives must be implemented across all services. It's acceptable to implement a directive as a no-op within a particular service, but it must still be defined.
- `EXECUTABLE_DIRECTIVES_IDENTICAL`: Custom directives must be implemented identically across all services. This means that arguments and their respective types, as well as the directive's locations, must all be identical within every service. Only [`ExecutableDirectiveLocation`s](https://graphql.github.io/graphql-spec/June2018/#ExecutableDirectiveLocation) are compared, as [`TypeSystemDirectiveLocation`s](https://graphql.github.io/graphql-spec/June2018/#TypeSystemDirectiveLocation) are ignored during composition.

### Enums and Scalars

- `DUPLICATE_ENUM_DEFINITION`: An Enum was defined multiple times in a single service. Remove one of the definitions.
- `DUPLICATE_SCALAR_DEFINITION`: A Scalar was defined multiple times in a single service. Remove one of the definitions.
- `DUPLICATE_ENUM_VALUE`: A service has multiple definitions of the same Enum `value`. This duplicate value can be in the definition itself or enum extensions.
- `ENUM_MISMATCH`: An Enum does not have identical values across all services. Even if a service does not use all enum values, they still must be provided if another service uses them. This error will list services with matching definitions like `[serviceA, serviceB], [serviceC]` where `serviceA` and `serviceB` have matching enum definitions, and `serviceC` does not match the other definitions.
- `ENUM_MISMATCH_TYPE`: Enums must not use the name of a type in another service. For example, if a service defines an enum of `Category`, all definitions of `Category` in other services must also be enums.

### Root Fields

- `RESERVED_FIELD_USED`: The `Query._service` and `Query._entities` fields are reserved, and should not be manually defined by any service.
- `ROOT_QUERY_USED`: `Query` is disallowed when a schema definition or extension is provided.
- `ROOT_MUTATION_USED`: `Mutation` is disallowed when a schema definition or extension is provided.
- `ROOT_SUBSCRIPTION_USED`: `Subscription` is disallowed when a schema definition or extension is provided.

### Value Types

- `VALUE_TYPE_FIELD_TYPE_MISMATCH`: Two identical types were found, however one or more of their field's types aren't the same. Value types must be identical across services.
- `VALUE_TYPE_NO_ENTITY`: Two identical types were found, however it's marked as an entity in one of the services. Extend the type correctly, or make the identical types non-entities.
- `VALUE_TYPE_UNION_TYPES_MISMATCH`: Two identical union types were found, however their types are not the same. Shared union types must be identical across services.
- `VALUE_TYPE_KIND_MISMATCH`: A type was found with the same name and fields, however they aren't of the same kind (object, input, interface). Only value types can be duplicated across services.

### Modified SDL validations

- Unique Type Names: type definitions can not be duplicated across services, with the exception of Enums, Scalars, and [value types](/federation/core-concepts/#value-types). This is a modified version of the `graphql-js` validation with exclusions for Enums and Scalars, since those are required to be duplicated across services.
