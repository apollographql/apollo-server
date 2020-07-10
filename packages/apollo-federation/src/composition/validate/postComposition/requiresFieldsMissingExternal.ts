import { isObjectType, FieldNode, GraphQLError } from 'graphql';
import { logServiceAndType, errorWithCode, getFederationMetadata } from '../../utils';
import { PostCompositionValidator } from '.';

/**
 *  for every @requires, there should be a matching @external
 */
export const requiresFieldsMissingExternal: PostCompositionValidator = ({
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

      // serviceName should always exist on fields that have @requires federation data, since
      // the only case where serviceName wouldn't exist is on a base type, and in that case,
      // the `requires` metadata should never get added to begin with. This should be caught in
      // composition work. This kind of error should be validated _before_ composition.
      if (!serviceName) continue;

      if (fieldFederationMetadata?.requires) {
        const typeFederationMetadata = getFederationMetadata(namedType);
        const externalFieldsOnTypeForService =
          typeFederationMetadata?.externals?.[serviceName];

        const selections = fieldFederationMetadata?.requires as FieldNode[];
        for (const selection of selections) {
          const foundMatchingExternal = externalFieldsOnTypeForService
            ? externalFieldsOnTypeForService.some(
                ext => ext.field.name.value === selection.name.value,
              )
            : undefined;
          if (!foundMatchingExternal) {
            errors.push(
              errorWithCode(
                'REQUIRES_FIELDS_MISSING_EXTERNAL',
                logServiceAndType(serviceName, typeName, fieldName) +
                  `requires the field \`${selection.name.value}\` to be marked as @external.`,
              ),
            );
          }
        }
      }
    }
  }

  return errors;
};
