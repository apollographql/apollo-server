import {
  GraphQLRequestContext,
  Logger,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextWillSendResponse,
} from 'apollo-server-types';
import { Headers } from 'apollo-server-env';
import { GraphQLSchema, printSchema } from 'graphql';
import { Trace } from 'apollo-engine-reporting-protobuf';

import {
  AddTraceArgs,
  EngineReportingOptions,
  GenerateClientInfo,
  SendValuesBaseOptions,
  VariableValueOptions,
} from './agent';
import { EngineReportingTreeBuilder } from './treeBuilder';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';

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
  {
    startSchemaReporting,
    executableSchemaIdGenerator,
  }: {
    startSchemaReporting: ({
      executableSchema,
      executableSchemaId,
    }: {
      executableSchema: string;
      executableSchemaId: string;
    }) => void;
    executableSchemaIdGenerator: (schema: string | GraphQLSchema) => string;
  },
): ApolloServerPlugin<TContext> => {
  /**
   * Non request-specific logging will go into this general logger.  Request-
   * specific log output (where the log output is only a result of a specific
   * request) will go to the `logger` which we get from the request context.
   */
  const loggerForPlugin: Logger = options.logger || console;

  const generateClientInfo: GenerateClientInfo<TContext> =
    options.generateClientInfo || defaultGenerateClientInfo;

  return {
    serverWillStart: function({ schema }) {
      if (!options.experimental_schemaReporting) return;
      startSchemaReporting({
        executableSchema:
          options.experimental_overrideReportedSchema || printSchema(schema),
        executableSchemaId: executableSchemaIdGenerator(
          options.experimental_overrideReportedSchema || schema,
        ),
      });
    },
    requestDidStart({
      logger: requestLogger,
      metrics,
      schema,
      request: { http, variables },
    }) {
      /**
       * Request specific log output should go into the `logger` from the
       * request context when it's provided.
       */
      const logger = requestLogger || loggerForPlugin;

      const treeBuilder: EngineReportingTreeBuilder = new EngineReportingTreeBuilder(
        {
          rewriteError: options.rewriteError,
          logger,
        },
      );

      treeBuilder.startTiming();

      metrics.startHrTime = treeBuilder.startHrTime;

      if (http) {
        treeBuilder.trace.http = new Trace.HTTP({
          method:
            Trace.HTTP.Method[http.method as keyof typeof Trace.HTTP.Method] ||
            Trace.HTTP.Method.UNKNOWN,
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

        if (options.sendHeaders) {
          makeHTTPRequestHeaders(
            treeBuilder.trace.http,
            http.headers,
            options.sendHeaders,
          );
        }
      }

      /**
       * Due to a number of exceptions in the request pipeline — which are
       * intended to preserve backwards compatible behavior with the
       * first generation of the request pipeline plugins prior to the
       * introduction of `didEncounterErrors` — we need to have this "didEnd"
       * functionality invoked from two places.  This accounts for the fact
       * that sometimes, under some special-cased error conditions,
       * `willSendResponse` is not invoked.  To zoom in on some of these cases,
       * check the `requestPipeline.ts` for `emitErrorAndThrow`.
       */
      let endDone: boolean = false;
      function didEnd(
        requestContext:
          | GraphQLRequestContextWillSendResponse<TContext>
          | GraphQLRequestContextDidEncounterErrors<TContext>,
      ) {
        if (endDone) return;
        endDone = true;
        treeBuilder.stopTiming();

        treeBuilder.trace.fullQueryCacheHit = !!metrics.responseCacheHit;
        treeBuilder.trace.forbiddenOperation = !!metrics.forbiddenOperation;
        treeBuilder.trace.registeredOperation = !!metrics.registeredOperation;

        // If operation resolution (parsing and validating the document followed
        // by selecting the correct operation) resulted in the population of the
        // `operationName`, we'll use that. (For anonymous operations,
        // `requestContext.operationName` is null, which we represent here as
        // the empty string.)
        //
        // If the user explicitly specified an `operationName` in their request
        // but operation resolution failed (due to parse or validation errors or
        // because there is no operation with that name in the document), we
        // still put _that_ user-supplied `operationName` in the trace. This
        // allows the error to be better understood in Graph Manager. (We are
        // considering changing the behavior of `operationName` in these 3 error
        // cases; https://github.com/apollographql/apollo-server/pull/3465)
        const operationName =
          requestContext.operationName ||
          requestContext.request.operationName ||
          '';

        // If this was a federated operation and we're the gateway, add the query plan
        // to the trace.
        if (metrics.queryPlanTrace) {
          treeBuilder.trace.queryPlan = metrics.queryPlanTrace;
        }

        // Intentionally un-awaited so as not to block the response.  Any
        // errors will be logged, but will not manifest a user-facing error.
        // The logger in this case is a request specific logger OR the logger
        // defined by the plugin if that's unavailable.  The request-specific
        // logger is preferred since this is very much coupled directly to a
        // client-triggered action which might be more granularly tagged by
        // logging implementations.
        addTrace({
          operationName,
          queryHash: requestContext.queryHash!,
          document: requestContext.document,
          source: requestContext.source,
          trace: treeBuilder.trace,
          executableSchemaId: executableSchemaIdGenerator(
            options.experimental_overrideReportedSchema || schema,
          ),
          logger,
        }).catch(logger.error);
      }

      // While we start the tracing as soon as possible, we only actually report
      // traces when we have resolved the source.  This is largely because of
      // the APQ negotiation that takes place before that resolution happens.
      // This is effectively bypassing the reporting of:
      //   - PersistedQueryNotFoundError
      //   - PersistedQueryNotSupportedError
      //   - InvalidGraphQLRequestError
      let didResolveSource: boolean = false;

      return {
        didResolveSource(requestContext) {
          didResolveSource = true;

          if (metrics.persistedQueryHit) {
            treeBuilder.trace.persistedQueryHit = true;
          }
          if (metrics.persistedQueryRegister) {
            treeBuilder.trace.persistedQueryRegister = true;
          }

          if (variables) {
            treeBuilder.trace.details = makeTraceDetails(
              variables,
              options.sendVariableValues,
              requestContext.source,
            );
          }

          const clientInfo = generateClientInfo(requestContext);
          if (clientInfo) {
            // While clientAddress could be a part of the protobuf, we'll ignore
            // it for now, since the backend does not group by it and Graph
            // Manager will not support it in the short term
            const { clientName, clientVersion, clientReferenceId } = clientInfo;
            // the backend makes the choice of mapping clientName => clientReferenceId if
            // no custom reference id is provided
            treeBuilder.trace.clientVersion = clientVersion || '';
            treeBuilder.trace.clientReferenceId = clientReferenceId || '';
            treeBuilder.trace.clientName = clientName || '';
          }
        },

        executionDidStart() {
          return {
            willResolveField({ info }) {
              return treeBuilder.willResolveField(info);
              // We could save the error into the trace during the end handler, but
              // it won't have all the information that graphql-js adds to it later,
              // like 'locations'.
            },
          };
        },

        willSendResponse(requestContext) {
          // See comment above for why `didEnd` must be called in two hooks.
          didEnd(requestContext);
        },

        didEncounterErrors(requestContext) {
          // Search above for a comment about "didResolveSource" to see which
          // of the pre-source-resolution errors we are intentionally avoiding.
          if (!didResolveSource) return;
          treeBuilder.didEncounterErrors(requestContext.errors);

          // See comment above for why `didEnd` must be called in two hooks.
          didEnd(requestContext);
        },
      };
    },
  };
};

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
