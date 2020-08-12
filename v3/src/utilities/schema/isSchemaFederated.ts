import {
  GraphQLSchema,
  isObjectType,
  isScalarType,
} from 'graphql';

// Returns true if it appears that the schema was returned from
// @apollo/federation's buildFederatedSchema. This strategy avoids depending
// explicitly on @apollo/federation or relying on something that might not
// survive transformations like monkey-patching a boolean field onto the
// schema.
//
// The only thing this is used for is determining whether traces should be
// added to responses if requested with an HTTP header; if there's a false
// positive, that feature can be disabled by specifying `engine: false`.
export function isSchemaFederated(schema: GraphQLSchema): boolean {
  const serviceType = schema.getType('_Service');
  if (!(serviceType && isObjectType(serviceType))) {
    return false;
  }
  const sdlField = serviceType.getFields().sdl;
  if (!sdlField) {
    return false;
  }
  const sdlFieldType = sdlField.type;
  if (!isScalarType(sdlFieldType)) {
    return false;
  }
  return sdlFieldType.name == 'String';
}
