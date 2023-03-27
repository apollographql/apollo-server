import {
  type GraphQLSchema,
  isObjectType,
  isScalarType,
  isNonNullType,
} from 'graphql';

// Returns true if it appears that the schema was appears to be of a subgraph
// (eg, returned from @apollo/subgraph's buildSubgraphSchema). This strategy
// avoids depending explicitly on @apollo/subgraph or relying on something that
// might not survive transformations like monkey-patching a boolean field onto
// the schema.
//
// This is used for two things:
// 1) Determining whether traces should be added to responses if requested with
//    an HTTP header. If you want to include these traces even for non-subgraphs
//    (when requested via header, eg for Apollo Explorer's trace view) you can
//    use ApolloServerPluginInlineTrace explicitly; if you want to never include
//    these traces even for subgraphs you can use
//    ApolloServerPluginInlineTraceDisabled.
// 2) Determining whether schema-reporting should be allowed; subgraphs cannot
//    report schemas, and we accordingly throw if it's attempted.
export function schemaIsSubgraph(schema: GraphQLSchema): boolean {
  const serviceType = schema.getType('_Service');
  if (!isObjectType(serviceType)) {
    return false;
  }
  const sdlField = serviceType.getFields().sdl;
  if (!sdlField) {
    return false;
  }

  let sdlFieldType = sdlField.type;
  if (isNonNullType(sdlFieldType)) {
    sdlFieldType = sdlFieldType.ofType;
  }
  if (!isScalarType(sdlFieldType)) {
    return false;
  }
  return sdlFieldType.name == 'String';
}
