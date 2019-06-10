import { visit, GraphQLError, EnumTypeDefinitionNode } from 'graphql';
import { ServiceDefinition } from '../../types';

import { logServiceAndType, errorWithCode } from '../../utils';

export const duplicateEnumValue = ({
  name: serviceName,
  typeDefs,
}: ServiceDefinition) => {
  const errors: GraphQLError[] = [];

  const enums: Map<String, String[]> = {};

  visit(typeDefs, {
    EnumTypeDefinition(definition) {
      const name = definition.name.value;
      const enumValues = definition.values.map(value => value.name.value);

      if (enums[name] && enums[name].length) {
        enumValues.map(valueName => {
          if (enums[name].includes(valueName)) {
            errors.push(
              errorWithCode(
                'DUPLICATE_ENUM_VALUE',
                logServiceAndType(serviceName, name, valueName) +
                  `The enum, \`${name}\` has multiple definitions of the \`${valueName}\` value.`,
              ),
            );
            return;
          }
          enums[name].push(valueName);
        });
      } else {
        enums[name] = enumValues;
      }

      return definition;
    },
    EnumTypeExtension(definition) {
      const name = definition.name.value;
      const enumValues = definition.values.map(value => value.name.value);

      if (enums[name] && enums[name].length) {
        enumValues.map(valueName => {
          if (enums[name].includes(valueName)) {
            errors.push(
              errorWithCode(
                'DUPLICATE_ENUM_VALUE',
                logServiceAndType(serviceName, name, valueName) +
                  `The enum, \`${name}\` has multiple definitions of the \`${valueName}\` value.`,
              ),
            );
            return;
          }
          enums[name].push(valueName);
        });
      } else {
        enums[name] = enumValues;
      }

      return definition;
    },
  });

  return errors;
};
