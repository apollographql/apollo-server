import { composeServices } from './compose';
import {
  validateComposedSchema,
  validateServicesBeforeComposition,
} from './validate';
import { ServiceDefinition } from './types';

export function composeAndValidate(serviceList: ServiceDefinition[]) {
  // generate errors or warnings of the individual services
  const errors = validateServicesBeforeComposition(serviceList);

  // generate a schema and any errors or warnings
  const compositionResult = composeServices(serviceList);
  errors.push(...compositionResult.errors);

  // validate the composed schema based on service information
  errors.push(...validateComposedSchema(compositionResult.schema));

  // TODO remove the warnings array once no longer used by clients
  return { schema: compositionResult.schema, warnings: [], errors };
}
