import {
  GraphQLRequestContext,
  Logger,
  InvalidGraphQLRequestError,
} from 'apollo-server-types';
import { Headers } from 'apollo-server-env';
import { GraphQLError } from 'graphql';
import { Trace } from 'apollo-engine-reporting-protobuf';

import {
  EngineReportingOptions,
  GenerateClientInfo,
  AddTraceArgs,
  VariableValueOptions,
  SendValuesBaseOptions,
} from './agent';
import { EngineReportingTreeBuilder } from './treeBuilder';
import { ApolloServerPlugin } from "apollo-server-plugin-base";
import {
  PersistedQueryNotFoundError,
  PersistedQueryNotSupportedError,
} from 'apollo-server-errors';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

const clientNameHeaderKey = 'apollographql-client-name';
const clientReferenceIdHeaderKey = 'apollographql-client-reference-id';
const clientVersionHeaderKey = 'apollographql-client-version';

// This plugin is instantiated once at server start-up. Each request that the
// server processes will invoke the `requestDidStart` method which will produce
// a trace (in protobuf Trace format) for that single request. When the request
// is done, it passes the Trace back to its associated EngineReportingAgent via
// the addTrace callback. This class isn't for direct use; its constructor is a
// private API for communicating with EngineReportingAgent.
export const plugin = <TContext>(
  options: EngineReportingOptions<TContext> = Object.create(null),
  addTrace: (args: AddTraceArgs) => Promise<void>,
  // schemaHash: string,
): ApolloServerPlugin<TContext> => {
  const logger: Logger = options.logger || console;
  const generateClientInfo: GenerateClientInfo<TContext> =
    options.generateClientInfo || defaultGenerateClientInfo;


  return {
    requestDidStart(requestContext) {
      let queryString: string | undefined;
      const treeBuilder: EngineReportingTreeBuilder =
        new EngineReportingTreeBuilder({
          rewriteError: options.rewriteError,
          logger: requestContext.logger || logger,
        });

      const metrics: NonNullable<typeof requestContext['metrics']> =
        ((requestContext as Mutable<typeof requestContext>)
          .metrics = requestContext.metrics || Object.create(null));

      treeBuilder.startTiming();
      metrics.startHrTime = treeBuilder.startHrTime;

      if (requestContext.request.http) {
        treeBuilder.trace.http = new Trace.HTTP({
          method:
            Trace.HTTP.Method[
              requestContext.request.http
                .method as keyof typeof Trace.HTTP.Method
            ] || Trace.HTTP.Method.UNKNOWN,
          // Host and path are not used anywhere on the backend, so let's not bother
          // trying to parse request.url to get them, which is a potential
          // source of bugs because integrations have different behavior here.
          // On Node's HTTP module, request.url only includes the path
          // (see https://nodejs.org/api/http.html#http_message_url)
          // The same is true on Lambda (where we pass event.path)
          // But on environments like Cloudflare we do get a complete URL.
          host: null,
          path: null,
        });
      }

      let preflightDone: boolean = false;
      function ensurePreflight() {
        if (preflightDone) return;
        preflightDone = true;

        if (options.sendHeaders) {
          if (requestContext.request.http && treeBuilder.trace.http) {
            makeHTTPRequestHeaders(
              treeBuilder.trace.http,
              requestContext.request.http.headers,
              options.sendHeaders,
            );
          }
        }

        if (metrics.persistedQueryHit) {
          treeBuilder.trace.persistedQueryHit = true;
        }
        if (metrics.persistedQueryRegister) {
          treeBuilder.trace.persistedQueryRegister = true;
        }

        // Generally, we'll get queryString here and not parsedQuery; we only get
        // parsedQuery if you're using an OperationStore. In normal cases we'll
        // get our documentAST in the execution callback after it is parsed.
        queryString = requestContext.source;

        if (requestContext.request.variables) {
          treeBuilder.trace.details = makeTraceDetails(
            requestContext.request.variables,
            options.sendVariableValues,
            queryString,
          );
        }

        const clientInfo = generateClientInfo(requestContext);
        if (clientInfo) {
          // While clientAddress could be a part of the protobuf, we'll ignore it for
          // now, since the backend does not group by it and Engine frontend will not
          // support it in the short term
          const { clientName, clientVersion, clientReferenceId } = clientInfo;
          // the backend makes the choice of mapping clientName => clientReferenceId if
          // no custom reference id is provided
          treeBuilder.trace.clientVersion = clientVersion || '';
          treeBuilder.trace.clientReferenceId = clientReferenceId || '';
          treeBuilder.trace.clientName = clientName || '';
        }
      }

      let endDone: boolean = false;
      function didEnd() {
        if (endDone) return;
        endDone = true;
        treeBuilder.stopTiming();

        treeBuilder.trace.fullQueryCacheHit = !!metrics.responseCacheHit;
        treeBuilder.trace.forbiddenOperation = !!metrics.forbiddenOperation;
        treeBuilder.trace.registeredOperation = !!metrics.registeredOperation;

        // If the user did not explicitly specify an operation name (which we
        // would have saved in `executionDidStart`), but the request pipeline made
        // it far enough to figure out what the operation name must be and store
        // it on requestContext.operationName, use that name.  (Note that this
        // depends on the assumption that the RequestContext passed to
        // requestDidStart, which does not yet have operationName, will be mutated
        // to add operationName later.)
        const operationName = requestContext.operationName || '';

        // If this was a federated operation and we're the gateway, add the query plan
        // to the trace.
        if (metrics.queryPlanTrace) {
          treeBuilder.trace.queryPlan = metrics.queryPlanTrace;
        }

        addTrace({
          operationName,
          queryHash: requestContext.queryHash!,
          documentAST: requestContext.document,
          queryString,
          trace: treeBuilder.trace,
          schemaHash: requestContext.schemaHash,
        });
      }

      return {
        parsingDidStart() {
          ensurePreflight();
        },

        validationDidStart() {
          ensurePreflight();
        },

        didResolveOperation() {
          ensurePreflight();
        },

        executionDidStart() {
          ensurePreflight();
          return didEnd;
        },

        willResolveField(...args) {
          const [, , , info] = args;
          return treeBuilder.willResolveField(info);
          // We could save the error into the trace during the end handler, but
          // it won't have all the information that graphql-js adds to it later,
          // like 'locations'.
        },

        didEncounterErrors({ errors }) {
          // We don't report some special-cased errors to Graph Manager.
          // See the definition of this function for the reasons.
          if (allUnreportableSpecialCasedErrors(errors)) {
            return;
          }

          ensurePreflight();
          treeBuilder.didEncounterErrors(errors);
          didEnd();
        },
      };
    }
  };
};

/**
 * Previously, prior to the new plugin API, the Apollo Engine Reporting
 * mechanism was implemented using `graphql-extensions`, the API for which
 * didn't invoke `requestDidStart` until _after_ APQ had been negotiated.
 *
 * The new plugin API starts its `requestDidStart` _before_ APQ validation and
 * various other assertions which weren't included in the `requestDidStart`
 * life-cycle, even if they perhaps should be in terms of error reporting.
 *
 * The new plugin API is able to properly capture such errors within its
 * `didEncounterErrors` lifecycle hook, however, for behavioral consistency
 * reasons, we will still special-case those errors and maintain the legacy
 * behavior to avoid a breaking change.  We can reconsider this in a future
 * version of Apollo Engine Reporting (AS3, perhaps!).
 *
 * @param errors A list of errors to scan for special-cased instances.
 */
function allUnreportableSpecialCasedErrors(
  errors: readonly GraphQLError[],
): boolean {
  return errors.every(err => {
    if (
      err instanceof PersistedQueryNotFoundError ||
      err instanceof PersistedQueryNotSupportedError ||
      err instanceof InvalidGraphQLRequestError
    ) {
      return true;
    }

    return false;
  });
}

// Helpers for producing traces.

function defaultGenerateClientInfo({ request }: GraphQLRequestContext) {
  // Default to using the `apollo-client-x` header fields if present.
  // If none are present, fallback on the `clientInfo` query extension
  // for backwards compatibility.
  // The default value if neither header values nor query extension is
  // set is the empty String for all fields (as per protobuf defaults)
  if (
    request.http &&
    request.http.headers &&
    (request.http.headers.get(clientNameHeaderKey) ||
      request.http.headers.get(clientVersionHeaderKey) ||
      request.http.headers.get(clientReferenceIdHeaderKey))
  ) {
    return {
      clientName: request.http.headers.get(clientNameHeaderKey),
      clientVersion: request.http.headers.get(clientVersionHeaderKey),
      clientReferenceId: request.http.headers.get(clientReferenceIdHeaderKey),
    };
  } else if (request.extensions && request.extensions.clientInfo) {
    return request.extensions.clientInfo;
  } else {
    return {};
  }
}

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
  // Engine web app currently does nothing with this other than store it in
  // the database and offer it up via its GraphQL API, and sending it means
  // that using calculateSignature to hide sensitive data in the query
  // string is ineffective.
  Object.keys(variablesToRecord).forEach(name => {
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
  variableNames.forEach(name => {
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
  originalKeys.forEach(name => {
    cleanedVariables[name] = modifiedVariables[name];
  });
  return cleanedVariables;
}

export function makeHTTPRequestHeaders(
  http: Trace.IHTTP,
  headers: Headers,
  sendHeaders?: SendValuesBaseOptions,
): void {
  if (
    !sendHeaders ||
    ('none' in sendHeaders && sendHeaders.none) ||
    ('all' in sendHeaders && !sendHeaders.all)
  ) {
    return;
  }
  for (const [key, value] of headers) {
    const lowerCaseKey = key.toLowerCase();
    if (
      ('exceptNames' in sendHeaders &&
        // We assume that most users only have a few headers to hide, or will
        // just set {none: true} ; we can change this linear-time
        // operation if it causes real performance issues.
        sendHeaders.exceptNames.some(exceptHeader => {
          // Headers are case-insensitive, and should be compared as such.
          return exceptHeader.toLowerCase() === lowerCaseKey;
        })) ||
      ('onlyNames' in sendHeaders &&
        !sendHeaders.onlyNames.some(header => {
          return header.toLowerCase() === lowerCaseKey;
        }))
    ) {
      continue;
    }

    switch (key) {
      case 'authorization':
      case 'cookie':
      case 'set-cookie':
        break;
      default:
        http!.requestHeaders![key] = new Trace.HTTP.Values({
          value: [value],
        });
    }
  }
}
