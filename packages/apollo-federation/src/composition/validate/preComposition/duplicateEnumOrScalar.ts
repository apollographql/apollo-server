import {
  visit,
  GraphQLError,
  EnumTypeDefinitionNode,
  ScalarTypeDefinitionNode,
} from 'graphql';
import { ServiceDefinition } from '../../types';

import { logServiceAndType, errorWithCode } from '../../utils';

export const duplicateEnumOrScalar = ({
  name: serviceName,
  typeDefs,
}: ServiceDefinition) => {
  const errors: GraphQLError[] = [];

  // keep track of every enum and scalar and error if there are ever duplicates
  const enums: EnumTypeDefinitionNode[] = [];
  const scalars: ScalarTypeDefinitionNode[] = [];

  visit(typeDefs, {
    EnumTypeDefinition(definition) {
      const name = definition.name.value;
      if (enums.includes(name)) {
        errors.push(
          errorWithCode(
            'DUPLICATE_ENUM_DEFINITION',
            logServiceAndType(serviceName, name) +
              `The enum, \`${name}\` was defined multiple times in this service. Remove one of the definitions for \`${name}\``,
          ),
        );
        return definition;
      }
      enums.push(name);
      return definition;
    },
    ScalarTypeDefinition(definition) {
      const name = definition.name.value;
      if (scalars.includes(name)) {
        errors.push(
          errorWithCode(
            'DUPLICATE_SCALAR_DEFINITION',
            logServiceAndType(serviceName, name) +
              `The scalar, \`${name}\` was defined multiple times in this service. Remove one of the definitions for \`${name}\``,
          ),
        );
        return definition;
      }
      scalars.push(name);
      return definition;
    },
  });

  return errors;
};
