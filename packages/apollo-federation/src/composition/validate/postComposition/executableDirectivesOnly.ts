import 'apollo-server-env';
import { GraphQLError, isSpecifiedDirective } from 'graphql';
import {
  logServiceAndType,
  errorWithCode,
  isExecutableDirective,
  isFederationDirective,
  executableDirectiveLocations,
} from '../../utils';
import { PostCompositionValidator } from '.';

/**
 * For custom directives, they must be an ExecutableDirective. ExecutableDirectives
 * consist of directives with strictly a subset of the following locations:
 * QUERY, MUTATION, SUBSCRIPTION, FIELD, FRAGMENT_DEFINITION, FRAGMENT_SPREAD,
 * INLINE_FRAGMENT, VARIABLE_DEFINITION
 */
export const executableDirectivesOnly: PostCompositionValidator = ({
  schema,
}) => {
  const errors: GraphQLError[] = [];

  // We only need to validate against user-provided, TypeSystemDirectives (non-executable directives)
  const customTypeSystemDirectives = schema
    .getDirectives()
    .filter(
      x =>
        !isFederationDirective(x) &&
        !isSpecifiedDirective(x) &&
        !isExecutableDirective(x),
    );

  customTypeSystemDirectives.forEach(directive => {
    if (!directive.federation) return;

    Object.keys(directive.federation.directiveDefinitions).forEach(
      serviceName => {
        errors.push(
          errorWithCode(
            'EXECUTABLE_DIRECTIVES_ONLY',
            logServiceAndType(serviceName, '@' + directive.name) +
              `is a type system directive, but only executable directives are permitted. Executable directives exist for the following locations: ${executableDirectiveLocations.join(
                ', ',
              )}`,
          ),
        );
      },
    );
  });
  return errors;
};
