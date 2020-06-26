import 'apollo-server-env';
import { GraphQLError, isSpecifiedDirective } from 'graphql';
import {
  errorWithCode,
  isFederationDirective,
  logDirective,
} from '../../utils';
import { PostCompositionValidator } from '.';

/**
 * All custom directives with executable locations must be implemented in every
 * service. This validator is not responsible for ensuring the directives are an
 * ExecutableDirective, however composition ensures this by filtering out all
 * TypeSystemDirectiveLocations.
 */
export const executableDirectivesInAllServices: PostCompositionValidator = ({
  schema,
  serviceList,
}) => {
  const errors: GraphQLError[] = [];

  const customExecutableDirectives = schema
    .getDirectives()
    .filter(x => !isFederationDirective(x) && !isSpecifiedDirective(x));

  customExecutableDirectives.forEach(directive => {
    if (!directive.federation) return;

    const allServiceNames = serviceList.map(({ name }) => name);
    const serviceNamesWithDirective = Object.keys(
      directive.federation.directiveDefinitions,
    );

    const serviceNamesWithoutDirective = allServiceNames.reduce(
      (without, serviceName) => {
        if (!serviceNamesWithDirective.includes(serviceName)) {
          without.push(serviceName);
        }
        return without;
      },
      [] as string[],
    );

    if (serviceNamesWithoutDirective.length > 0) {
      errors.push(
        errorWithCode(
          'EXECUTABLE_DIRECTIVES_IN_ALL_SERVICES',
          logDirective(directive.name) +
            `Custom directives must be implemented in every service. The following services do not implement the @${
              directive.name
            } directive: ${serviceNamesWithoutDirective.join(', ')}.`,
        ),
      );
    }
  });

  return errors;
};
