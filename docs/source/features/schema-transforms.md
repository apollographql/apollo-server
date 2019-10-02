---
title: Schema transforms
description: Automatically transforming schemas
---

Schema transforms are a tool for making modified copies of `GraphQLSchema` objects, while preserving the possibility of delegating back to original schema.

Transforms are useful when working with [remote schemas](/features/remote-schemas/), building GraphQL gateways that combine multiple schemas, and/or using [schema stitching](/features/schema-stitching/) to combine schemas together without conflicts between types or fields.

While it's possible to modify a schema by hand, the manual approach requires a deep understanding of all the relationships between `GraphQLSchema` properties, which makes it error-prone and labor-intensive. Transforms provide a generic abstraction over all those details, which improves code quality and saves time, not only now but also in the future, because transforms are designed to be reused again and again.

Each `Transform` may define three different kinds of transform functions:

```ts
interface Transform = {
  transformSchema?: (schema: GraphQLSchema) => GraphQLSchema;
  transformRequest?: (request: Request) => Request;
  transformResult?: (result: Result) => Result;
};
```

The most commonly used transform function is `transformSchema`. However, some transforms require modifying incoming requests and/or outgoing results as well, especially if `transformSchema` adds or removes types or fields, since such changes require mapping new types/fields to the original types/fields at runtime.

For example, let's consider changing the name of the type in a simple schema. Imagine we've written a function that takes a `GraphQLSchema` and replaces all instances of type `Test` with `NewTest`.

```graphql
# old schema
type Test {
  id: ID!
  name: String
}

type Query {
  returnTest: Test
}

# new schema

type NewTest {
  id: ID!
  name: String
}

type Query {
  returnTest: NewTest
}
```

At runtime, we want the `NewTest` type to be automatically mapped to the old `Test` type.

At first glance, it might seem as though most queries work the same way as before:

```graphql
query {
  returnTest {
    id
    name
  }
}
```

Since the fields of the type have not changed, delegating to the old schema is relatively easy here.

However, the new name begins to matter more when fragments and variables are used:

```graphql
query {
  returnTest {
    id
    ... on NewTest {
      name
    }
  }
}
```

Since the `NewTest` type did not exist on old schema, this fragment will not match anything in the old schema, so it will be filtered out during delegation.

What we need is a `transformRequest` function that knows how to rename any occurrences of `NewTest` to `Test` before delegating to the old schema.

By the same reasoning, we also need a `transformResult` function, because any results contain a `__typename` field whose value is `Test`, that name needs to be updated to `NewTest` in the final result.

## API

### Transform

```ts
interface Transform = {
  transformSchema?: (schema: GraphQLSchema) => GraphQLSchema;
  transformRequest?: (request: Request) => Request;
  transformResult?: (result: Result) => Result;
};

type Request = {
  document: DocumentNode;
  variables: Record<string, any>;
  extensions?: Record<string, any>;
};

type Result = ExecutionResult & {
  extensions?: Record<string, any>;
};
```

### transformSchema

Given a `GraphQLSchema` and an array of `Transform` objects, produce a new schema with those transforms applied.

Delegating resolvers will also be generated to map from new schema root fields to old schema root fields. Often these automatic resolvers are sufficient, so you don't have to implement your own.

## Built-in transforms

Built-in transforms are ready-made classes implementing the `Transform` interface. They are intended to cover many of the most common schema transformation use cases, but they also serve as examples of how to implement transforms for your own needs.

### Modifying types

* `FilterTypes(filter: (type: GraphQLNamedType) => boolean)`: Remove all types for which the `filter` function returns `false`.

* `RenameTypes(renamer, options?)`: Rename types by applying `renamer` to each type name. If `renamer` returns `undefined`, the name will be left unchanged. Options controls whether built-in types and scalars are renamed. Root objects are never renamed by this transform.

```ts
RenameTypes(
  (name: string) => string | void,
  options?: {
    renameBuiltins: Boolean;
    renameScalars: Boolean;
  },
)
```

### Modifying root fields

* `TransformRootFields(transformer: RootTransformer)`: Given a transformer, abritrarily transform root fields. The `transformer` can return a `GraphQLFieldConfig` definition, a object with new `name` and a `field`, `null` to remove the field, or `undefined` to leave the field unchanged.

```ts
TransformRootFields(transformer: RootTransformer)

type RootTransformer = (
  operation: 'Query' | 'Mutation' | 'Subscription',
  fieldName: string,
  field: GraphQLField<any, any>,
) =>
  | GraphQLFieldConfig<any, any>
  | { name: string; field: GraphQLFieldConfig<any, any> }
  | null
  | void;
```

* `FilterRootFields(filter: RootFilter)`: Like `FilterTypes`, removes root fields for which the `filter` function returns `false`.

```ts
FilterRootFields(filter: RootFilter)

type RootFilter = (
  operation: 'Query' | 'Mutation' | 'Subscription',
  fieldName: string,
  field: GraphQLField<any, any>,
) => boolean;
```

* `RenameRootFields(renamer)`: Rename root fields, by applying the `renamer` function to their names.

```ts
RenameRootFields(
  renamer: (
    operation: 'Query' | 'Mutation' | 'Subscription',
    name: string,
    field: GraphQLField<any, any>,
  ) => string,
)
```

### Other

* `ExractField({ from: Array<string>, to: Array<string> })` - move selection at `from` path to `to` path.

* `WrapQuery(
    path: Array<string>,
    wrapper: QueryWrapper,
    extractor: (result: any) => any,
  )` - wrap a selection at `path` using function `wrapper`. Apply `extractor` at the same path to get the result. This is used to get a result nested inside other result

```js
transforms: [
  // Wrap document takes a subtree as an AST node
  new WrapQuery(
    // path at which to apply wrapping and extracting
    ['userById'],
    (subtree: SelectionSetNode) => ({
      // we create a wrapping AST Field
      kind: Kind.FIELD,
      name: {
        kind: Kind.NAME,
        // that field is `address`
        value: 'address',
      },
      // Inside the field selection
      selectionSet: subtree,
    }),
    // how to process the data result at path
    result => result && result.address,
  ),
],
```

* `ReplaceFieldWithFragment(targetSchema: GraphQLSchema, mapping: FieldToFragmentMapping)`: Replace the given fields with an inline fragment. Used by `mergeSchemas` to handle the `fragment` option.

```ts
type FieldToFragmentMapping = {
  [typeName: string]: { [fieldName: string]: InlineFragmentNode };
};
```

## delegateToSchema transforms

The following transforms are automatically applied by `delegateToSchema` during schema delegation, to translate between new and old types and fields:

* `AddArgumentsAsVariables`: Given a schema and arguments passed to a root field, make those arguments document variables.
* `FilterToSchema`: Given a schema and document, remove all fields, variables and fragments for types that don't exist in that schema.
* `AddTypenameToAbstract`: Add `__typename` to all abstract types in the document.
* `CheckResultAndHandleErrors`: Given a result from a subschema, propagate errors so that they match the correct subfield. Also provide the correct key if aliases are used.

By passing a custom `transforms` array to `delegateToSchema`, it's possible to run additional transforms before these default transforms, though it is currently not possible to disable the default transforms.
