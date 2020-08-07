import 'apollo-server-env';
import { isObjectType, GraphQLError } from 'graphql';
import { logServiceAndType, errorWithCode, getFederationMetadata } from '../../utils';
import { PostCompositionValidator } from '.';

/**
 * All fields marked with @external must exist on the base type
 */
export const externalMissingOnBase: PostCompositionValidator = ({ schema }) => {
  const errors: GraphQLError[] = [];

  const types = schema.getTypeMap();
  for (const [typeName, namedType] of Object.entries(types)) {
    // Only object types have fields
    if (!isObjectType(namedType)) continue;

    const typeFederationMetadata = getFederationMetadata(namedType);

    // If externals is populated, we need to look at each one and confirm
    // that field exists on base service
    if (typeFederationMetadata?.externals) {
      // loop over every service that has extensions with @external
      for (const [serviceName, externalFieldsForService] of Object.entries(
        typeFederationMetadata.externals,
      )) {
        // for a single service, loop over the external fields.
        for (const { field: externalField } of externalFieldsForService) {
          const externalFieldName = externalField.name.value;
          const allFields = namedType.getFields();
          const matchingBaseField = allFields[externalFieldName];

          // @external field referenced a field that isn't defined anywhere
          if (!matchingBaseField) {
            errors.push(
              errorWithCode(
                'EXTERNAL_MISSING_ON_BASE',
                logServiceAndType(serviceName, typeName, externalFieldName) +
                  `marked @external but ${externalFieldName} is not defined on the base service of ${typeName} (${typeFederationMetadata.serviceName})`,
              ),
            );
            continue;
          }

          // if the field has a serviceName, then it wasn't defined by the
          // service that owns the type
          const fieldFederationMetadata = getFederationMetadata(matchingBaseField);

          if (fieldFederationMetadata?.serviceName) {
            errors.push(
              errorWithCode(
                'EXTERNAL_MISSING_ON_BASE',
                logServiceAndType(serviceName, typeName, externalFieldName) +
                  `marked @external but ${externalFieldName} was defined in ${fieldFederationMetadata.serviceName}, not in the service that owns ${typeName} (${typeFederationMetadata.serviceName})`,
              ),
            );
          }
        }
      }
    }
  }
  return errors;
};
