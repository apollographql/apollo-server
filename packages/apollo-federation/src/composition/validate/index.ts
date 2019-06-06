import { GraphQLSchema, GraphQLError, validateSchema } from 'graphql';
import { ServiceDefinition } from '../types';

// import validators
import * as preNormalizationRules from './preNormalization';
import * as preCompositionRules from './preComposition';
import * as postCompositionRules from './postComposition';

const preNormalizationValidators = Object.values(preNormalizationRules);

export function validateServicesBeforeNormalization(
  services: ServiceDefinition[],
) {
  const errors: GraphQLError[] = [];

  for (const serviceDefinition of services) {
    for (const validator of preNormalizationValidators) {
      errors.push(...validator(serviceDefinition));
    }
  }

  return errors;
}

const preCompositionValidators = Object.values(preCompositionRules);

export const validateServicesBeforeComposition = (
  services: ServiceDefinition[],
) => {
  const warningsOrErrors: GraphQLError[] = [];

  for (const serviceDefinition of services) {
    for (const validator of preCompositionValidators) {
      warningsOrErrors.push(...validator(serviceDefinition));
    }
  }

  return warningsOrErrors;
};

const postCompositionValidators = [
  validateSchema,
  ...Object.values(postCompositionRules),
];

export const validateComposedSchema = (
  schema: GraphQLSchema,
): GraphQLError[] => {
  const warningsOrErrors: GraphQLError[] = [];

  // https://github.com/graphql/graphql-js/blob/4b55f10f16cc77302613e8ad67440259c68633df/src/type/validate.js#L56
  for (const validator of postCompositionValidators) {
    warningsOrErrors.push(...validator(schema));
  }

  return warningsOrErrors;
};
