import { isObjectType, FieldNode, GraphQLError } from 'graphql';
import { logServiceAndType, errorWithCode, getFederationMetadata } from '../../utils';
import { PostCompositionValidator } from '.';

/**
 *  for every field in a @provides, there should be a matching @external
 */
export const providesFieldsMissingExternal: PostCompositionValidator = ({
  schema,
}) => {
  const errors: GraphQLError[] = [];

  const types = schema.getTypeMap();
  for (const [typeName, namedType] of Object.entries(types)) {
    // Only object types have fields
    if (!isObjectType(namedType)) continue;

    // for each field, if there's a requires on it, check that there's a matching
    // @external field, and that the types referenced are from the base type
    for (const [fieldName, field] of Object.entries(namedType.getFields())) {
      const fieldFederationMetadata = getFederationMetadata(field);
      const serviceName = fieldFederationMetadata?.serviceName;

      // serviceName should always exist on fields that have @provides federation data, since
      // the only case where serviceName wouldn't exist is on a base type, and in that case,
      // the `provides` metadata should never get added to begin with. This should be caught in
      // composition work. This kind of error should be validated _before_ composition.
      if (!serviceName) continue;

      const fieldType = field.type;
      if (!isObjectType(fieldType)) continue;

      const fieldTypeFederationMetadata = getFederationMetadata(fieldType);

      const externalFieldsOnTypeForService = fieldTypeFederationMetadata?.externals?.[serviceName];

      if (fieldFederationMetadata?.provides) {
        const selections = fieldFederationMetadata.provides as FieldNode[];
        for (const selection of selections) {
          const foundMatchingExternal = externalFieldsOnTypeForService
            ? externalFieldsOnTypeForService.some(
                ext => ext.field.name.value === selection.name.value,
              )
            : undefined;
          if (!foundMatchingExternal) {
            errors.push(
              errorWithCode(
                'PROVIDES_FIELDS_MISSING_EXTERNAL',
                logServiceAndType(serviceName, typeName, fieldName) +
                  `provides the field \`${selection.name.value}\` and requires ${fieldType}.${selection.name.value} to be marked as @external.`,
              ),
            );
          }
        }
      }
    }
  }

  return errors;
};
