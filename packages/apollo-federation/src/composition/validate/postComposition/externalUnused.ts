import { isObjectType, GraphQLError, Kind } from 'graphql';
import {
  findDirectivesOnTypeOrField,
  logServiceAndType,
  hasMatchingFieldInDirectives,
  errorWithCode,
  findFieldsThatReturnType,
  parseSelections,
  isStringValueNode,
  selectionIncludesField,
} from '../../utils';
import { PostCompositionValidator } from '.';

/**
 *  for every @external field, there should be a @requires, @key, or @provides
 *  directive that uses it
 */
export const externalUnused: PostCompositionValidator = ({ schema }) => {
  const errors: GraphQLError[] = [];
  const types = schema.getTypeMap();
  for (const [parentTypeName, parentType] of Object.entries(types)) {
    // Only object types have fields
    if (!isObjectType(parentType)) continue;
    // If externals is populated, we need to look at each one and confirm
    // it is used
    if (parentType.federation && parentType.federation.externals) {
      // loop over every service that has extensions with @external
      for (const [serviceName, externalFieldsForService] of Object.entries(
        parentType.federation.externals,
      )) {
        // for a single service, loop over the external fields.
        for (const { field: externalField } of externalFieldsForService) {
          const externalFieldName = externalField.name.value;

          // check the selected fields of every @key provided by `serviceName`
          const hasMatchingKeyOnType = Boolean(
            hasMatchingFieldInDirectives({
              directives: findDirectivesOnTypeOrField(
                parentType.astNode,
                'key',
              ),
              fieldNameToMatch: externalFieldName,
              namedType: parentType,
            }),
          );
          if (hasMatchingKeyOnType) continue;

          /*
            @provides is most commonly used from another type than where
            the @external directive is applied. We need to find all
            fields on any type in the schema that return this type
            and see if they have a provides directive that uses this
            external field

            extend type Review {
              author: User @provides(fields: "username")
            }

            extend type User @key(fields: "id") {
              id: ID! @external
              username: String @external
              reviews: [Review]
            }
          */
          const hasMatchingProvidesOnAnotherType = findFieldsThatReturnType({
            schema,
            typeToFind: parentType,
          }).some(field =>
            findDirectivesOnTypeOrField(field.astNode, 'provides').some(
              directive => {
                if (!directive.arguments) return false;
                const selections =
                  isStringValueNode(directive.arguments[0].value) &&
                  parseSelections(directive.arguments[0].value.value);
                // find the selections which are fields with names matching
                // our external field name
                return (
                  selections &&
                  selections.some(
                    selection =>
                      selection.kind === Kind.FIELD &&
                      selection.name.value === externalFieldName,
                  )
                );
              },
            ),
          );

          if (hasMatchingProvidesOnAnotherType) continue;

          /**
           * @external fields can be selected by subfields of a selection on another type
           *
           * For example, with these defs, `canWrite` is marked as external and is
           * referenced by a selection set inside the @requires of User.isAdmin
           *
           *    extend type User @key(fields: "id") {
           *      roles: AccountRoles!
           *      isAdmin: Boolean! @requires(fields: "roles { canWrite permission { status } }")
           *    }
           *    extend type AccountRoles {
           *      canWrite: Boolean @external
           *      permission: Permission @external
           *    }
           *
           *    extend type Permission {
           *      status: String @external
           *    }
           *
           * So, we need to search for fields with requires, then parse the selection sets,
           * and try to recursively find the external field's PARENT type, then the external field's name
           */
          const hasMatchingRequiresOnAnotherType = Object.values(
            schema.getTypeMap(),
          ).some(namedType => {
            if (!isObjectType(namedType)) return false;
            // for every object type, loop over its fields and find fields
            // with requires directives
            return Object.values(namedType.getFields()).some(field =>
              findDirectivesOnTypeOrField(field.astNode, 'requires').some(
                directive => {
                  if (!directive.arguments) return false;
                  const selections =
                    isStringValueNode(directive.arguments[0].value) &&
                    parseSelections(directive.arguments[0].value.value);

                  if (!selections) return false;
                  return selectionIncludesField({
                    selections,
                    selectionSetType: namedType,
                    typeToFind: parentType,
                    fieldToFind: externalFieldName,
                  });
                },
              ),
            );
          });

          if (hasMatchingRequiresOnAnotherType) continue;

          const hasMatchingRequiresOnType = Object.values(
            parentType.getFields(),
          ).some(maybeRequiresField => {
            const fieldOwner =
              maybeRequiresField.federation &&
              maybeRequiresField.federation.serviceName;
            if (fieldOwner !== serviceName) return false;

            const requiresDirectives = findDirectivesOnTypeOrField(
              maybeRequiresField.astNode,
              'requires',
            );

            return hasMatchingFieldInDirectives({
              directives: requiresDirectives,
              fieldNameToMatch: externalFieldName,
              namedType: parentType,
            });
          });

          if (hasMatchingRequiresOnType) continue;

          errors.push(
            errorWithCode(
              'EXTERNAL_UNUSED',
              logServiceAndType(
                serviceName,
                parentTypeName,
                externalFieldName,
              ) +
                `is marked as @external but is not used by a @requires, @key, or @provides directive.`,
            ),
          );
        }
      }
    }
  }

  return errors;
};
