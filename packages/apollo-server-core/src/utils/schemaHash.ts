import { parse } from 'graphql/language';
import { execute, ExecutionResult } from 'graphql/execution';
import { getIntrospectionQuery, IntrospectionSchema } from 'graphql/utilities';
import stableStringify from 'fast-json-stable-stringify';
import { GraphQLSchema } from 'graphql/type';
import createSHA from './createSHA';
import { SchemaHash } from "apollo-server-types";

export function generateSchemaHash(schema: GraphQLSchema): SchemaHash {
  const introspectionQuery = getIntrospectionQuery();
  const documentAST = parse(introspectionQuery);
  const result = execute(schema, documentAST) as ExecutionResult;

  // If the execution of an introspection query results in a then-able, it
  // indicates that one or more of its resolvers is behaving in an asynchronous
  // manner.  This is not the expected behavior of a introspection query
  // which does not have any asynchronous resolvers.
  if (
    result &&
    typeof (result as PromiseLike<typeof result>).then === 'function'
  ) {
    throw new Error(
      [
        'The introspection query is resolving asynchronously; execution of an introspection query is not expected to return a `Promise`.',
        '',
        'Wrapped type resolvers should maintain the existing execution dynamics of the resolvers they wrap (i.e. async vs sync) or introspection types should be excluded from wrapping by checking them with `graphql/type`s, `isIntrospectionType` predicate function prior to wrapping.',
      ].join('\n'),
    );
  }

  if (!result || !result.data || !result.data.__schema) {
    throw new Error('Unable to generate server introspection document.');
  }

  const introspectionSchema: IntrospectionSchema = result.data.__schema;

  // It's important that we perform a deterministic stringification here
  // since, depending on changes in the underlying `graphql-js` execution
  // layer, varying orders of the properties in the introspection
  const stringifiedSchema = stableStringify(introspectionSchema);

  return createSHA('sha512')
    .update(stringifiedSchema)
    .digest('hex') as SchemaHash;
}
