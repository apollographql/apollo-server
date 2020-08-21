import { composeServices } from './compose';
import {
  validateComposedSchema,
  validateServicesBeforeComposition,
  validateServicesBeforeNormalization,
} from './validate';
import { ServiceDefinition } from './types';
import { normalizeTypeDefs } from './normalize';
import { printComposedSdl } from '../service/printComposedSdl';

export function composeAndValidate(serviceList: ServiceDefinition[]) {
  const errors = validateServicesBeforeNormalization(serviceList);

  const normalizedServiceList = serviceList.map(({ name, typeDefs }) => ({
    name,
    typeDefs: normalizeTypeDefs(typeDefs),
  }));

  // generate errors or warnings of the individual services
  errors.push(...validateServicesBeforeComposition(normalizedServiceList));

  // generate a schema and any errors or warnings
  const compositionResult = composeServices(normalizedServiceList);
  errors.push(...compositionResult.errors);

  // validate the composed schema based on service information
  errors.push(
    ...validateComposedSchema({
      schema: compositionResult.schema,
      serviceList,
    }),
  );

  // We shouldn't try to print the SDL if there were errors during composition
  const composedSdl =
    errors.length === 0
      ? printComposedSdl(compositionResult.schema, serviceList)
      : undefined;

  // TODO remove the warnings array once no longer used by clients
  return {
    schema: compositionResult.schema,
    warnings: [],
    errors,
    composedSdl,
  };
}
