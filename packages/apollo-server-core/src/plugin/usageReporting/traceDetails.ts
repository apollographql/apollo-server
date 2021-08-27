import { Trace } from 'apollo-reporting-protobuf';
import type { VariableValueOptions } from './options';

// Creates trace details from request variables, given a specification for modifying
// values of private or sensitive variables.
// The details will include all variable names and their (possibly hidden or modified) values.
// If sendVariableValues is {all: bool}, {none: bool} or {exceptNames: Array}, the option will act similarly to
// to the to-be-deprecated options.privateVariables, except that the redacted variable
// names will still be visible in the UI even if the values are hidden.
// If sendVariableValues is null or undefined, we default to the {none: true} case.
export function makeTraceDetails(
  variables: Record<string, any>,
  sendVariableValues?: VariableValueOptions,
  operationString?: string,
): Trace.Details {
  const details = new Trace.Details();
  const variablesToRecord = (() => {
    if (sendVariableValues && 'transform' in sendVariableValues) {
      const originalKeys = Object.keys(variables);
      try {
        // Custom function to allow user to specify what variablesJson will look like
        const modifiedVariables = sendVariableValues.transform({
          variables: variables,
          operationString: operationString,
        });
        return cleanModifiedVariables(originalKeys, modifiedVariables);
      } catch (e) {
        // If the custom function provided by the user throws an exception,
        // change all the variable values to an appropriate error message.
        return handleVariableValueTransformError(originalKeys);
      }
    } else {
      return variables;
    }
  })();

  // Note: we explicitly do *not* include the details.rawQuery field. The
  // Studio web app currently does nothing with this other than store it in
  // the database and offer it up via its GraphQL API, and sending it means
  // that using calculateSignature to hide sensitive data in the query
  // string is ineffective.
  Object.keys(variablesToRecord).forEach((name) => {
    if (
      !sendVariableValues ||
      ('none' in sendVariableValues && sendVariableValues.none) ||
      ('all' in sendVariableValues && !sendVariableValues.all) ||
      ('exceptNames' in sendVariableValues &&
        // We assume that most users will have only a few variables values to hide,
        // or will just set {none: true}; we can change this
        // linear-time operation if it causes real performance issues.
        sendVariableValues.exceptNames.includes(name)) ||
      ('onlyNames' in sendVariableValues &&
        !sendVariableValues.onlyNames.includes(name))
    ) {
      // Special case for private variables. Note that this is a different
      // representation from a variable containing the empty string, as that
      // will be sent as '""'.
      details.variablesJson![name] = '';
    } else {
      try {
        details.variablesJson![name] =
          typeof variablesToRecord[name] === 'undefined'
            ? ''
            : JSON.stringify(variablesToRecord[name]);
      } catch (e) {
        details.variablesJson![name] = JSON.stringify(
          '[Unable to convert value to JSON]',
        );
      }
    }
  });
  return details;
}

function handleVariableValueTransformError(
  variableNames: string[],
): Record<string, any> {
  const modifiedVariables = Object.create(null);
  variableNames.forEach((name) => {
    modifiedVariables[name] = '[PREDICATE_FUNCTION_ERROR]';
  });
  return modifiedVariables;
}

// Helper for makeTraceDetails() to enforce that the keys of a modified 'variables'
// matches that of the original 'variables'
function cleanModifiedVariables(
  originalKeys: Array<string>,
  modifiedVariables: Record<string, any>,
): Record<string, any> {
  const cleanedVariables: Record<string, any> = Object.create(null);
  originalKeys.forEach((name) => {
    cleanedVariables[name] = modifiedVariables[name];
  });
  return cleanedVariables;
}
