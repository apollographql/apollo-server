import { GraphQLRequestContext, WithRequired } from 'apollo-server-types';
import { Request, Headers } from 'apollo-server-env';
import {
  GraphQLResolveInfo,
  DocumentNode,
  ExecutionArgs,
  GraphQLError,
} from 'graphql';
import { GraphQLExtension, EndHandler } from 'graphql-extensions';
import { Trace } from 'apollo-engine-reporting-protobuf';

import {
  EngineReportingOptions,
  GenerateClientInfo,
  AddTraceArgs,
  VariableValueOptions,
  SendValuesBaseOptions,
} from './agent';
import { EngineReportingTreeBuilder } from './treeBuilder';

const clientNameHeaderKey = 'apollographql-client-name';
const clientReferenceIdHeaderKey = 'apollographql-client-reference-id';
const clientVersionHeaderKey = 'apollographql-client-version';

// EngineReportingExtension is the per-request GraphQLExtension which creates a
// trace (in protobuf Trace format) for a single request. When the request is
// done, it passes the Trace back to its associated EngineReportingAgent via the
// addTrace callback in its constructor. This class isn't for direct use; its
// constructor is a private API for communicating with EngineReportingAgent.
// Its public methods all implement the GraphQLExtension interface.
export class EngineReportingExtension<TContext = any>
  implements GraphQLExtension<TContext> {
  private treeBuilder: EngineReportingTreeBuilder;
  private explicitOperationName?: string | null;
  private queryString?: string;
  private documentAST?: DocumentNode;
  private options: EngineReportingOptions<TContext>;
  private addTrace: (args: AddTraceArgs) => Promise<void>;
  private generateClientInfo: GenerateClientInfo<TContext>;

  public constructor(
    options: EngineReportingOptions<TContext>,
    addTrace: (args: AddTraceArgs) => Promise<void>,
    private schemaHash: string,
  ) {
    this.options = {
      ...options,
    };
    this.addTrace = addTrace;
    this.generateClientInfo =
      options.generateClientInfo || defaultGenerateClientInfo;

    this.treeBuilder = new EngineReportingTreeBuilder({
      rewriteError: options.rewriteError,
    });
  }

  public requestDidStart(o: {
    request: Request;
    queryString?: string;
    parsedQuery?: DocumentNode;
    variables?: Record<string, any>;
    context: TContext;
    extensions?: Record<string, any>;
    requestContext: WithRequired<
      GraphQLRequestContext<TContext>,
      'metrics' | 'queryHash'
    >;
  }): EndHandler {
    this.treeBuilder.startTiming();
    o.requestContext.metrics.startHrTime = this.treeBuilder.startHrTime;

    // Generally, we'll get queryString here and not parsedQuery; we only get
    // parsedQuery if you're using an OperationStore. In normal cases we'll get
    // our documentAST in the execution callback after it is parsed.
    const queryHash = o.requestContext.queryHash;
    this.queryString = o.queryString;
    this.documentAST = o.parsedQuery;

    this.treeBuilder.trace.http = new Trace.HTTP({
      method:
        Trace.HTTP.Method[o.request.method as keyof typeof Trace.HTTP.Method] ||
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

    if (this.options.sendHeaders) {
      makeHTTPRequestHeaders(
        this.treeBuilder.trace.http,
        o.request.headers,
        this.options.sendHeaders,
      );

      if (o.requestContext.metrics.persistedQueryHit) {
        this.treeBuilder.trace.persistedQueryHit = true;
      }
      if (o.requestContext.metrics.persistedQueryRegister) {
        this.treeBuilder.trace.persistedQueryRegister = true;
      }
    }

    if (o.variables) {
      this.treeBuilder.trace.details = makeTraceDetails(
        o.variables,
        this.options.sendVariableValues,
        o.queryString,
      );
    }

    const clientInfo = this.generateClientInfo(o.requestContext);
    if (clientInfo) {
      // While clientAddress could be a part of the protobuf, we'll ignore it for
      // now, since the backend does not group by it and Engine frontend will not
      // support it in the short term
      const { clientName, clientVersion, clientReferenceId } = clientInfo;
      // the backend makes the choice of mapping clientName => clientReferenceId if
      // no custom reference id is provided
      this.treeBuilder.trace.clientVersion = clientVersion || '';
      this.treeBuilder.trace.clientReferenceId = clientReferenceId || '';
      this.treeBuilder.trace.clientName = clientName || '';
    }

    return () => {
      this.treeBuilder.stopTiming();

      this.treeBuilder.trace.fullQueryCacheHit = !!o.requestContext.metrics
        .responseCacheHit;
      this.treeBuilder.trace.forbiddenOperation = !!o.requestContext.metrics
        .forbiddenOperation;
      this.treeBuilder.trace.registeredOperation = !!o.requestContext.metrics
        .registeredOperation;

      // If the user did not explicitly specify an operation name (which we
      // would have saved in `executionDidStart`), but the request pipeline made
      // it far enough to figure out what the operation name must be and store
      // it on requestContext.operationName, use that name.  (Note that this
      // depends on the assumption that the RequestContext passed to
      // requestDidStart, which does not yet have operationName, will be mutated
      // to add operationName later.)
      const operationName =
        this.explicitOperationName || o.requestContext.operationName || '';
      const documentAST = this.documentAST || o.requestContext.document;

      // If this was a federated operation and we're the gateway, add the query plan
      // to the trace.
      if (o.requestContext.metrics.queryPlanTrace) {
        this.treeBuilder.trace.queryPlan =
          o.requestContext.metrics.queryPlanTrace;
      }

      this.addTrace({
        operationName,
        queryHash,
        documentAST,
        queryString: this.queryString || '',
        trace: this.treeBuilder.trace,
        schemaHash: this.schemaHash,
      });
    };
  }

  public executionDidStart(o: { executionArgs: ExecutionArgs }) {
    // If the operationName is explicitly provided, save it. Note: this is the
    // operationName provided by the user. It might be empty if they're relying on
    // the "just use the only operation I sent" behavior, even if that operation
    // has a name.
    //
    // It's possible that execution is about to fail because this operation
    // isn't actually in the document. We want to know the name in that case
    // too, which is why it's important that we save the name now, and not just
    // rely on requestContext.operationName (which will be null in this case).
    if (o.executionArgs.operationName) {
      this.explicitOperationName = o.executionArgs.operationName;
    }
    this.documentAST = o.executionArgs.document;
  }

  public willResolveField(
    _source: any,
    _args: { [argName: string]: any },
    _context: TContext,
    info: GraphQLResolveInfo,
  ): ((error: Error | null, result: any) => void) | void {
    return this.treeBuilder.willResolveField(info);
    // We could save the error into the trace during the end handler, but it
    // won't have all the information that graphql-js adds to it later, like
    // 'locations'.
  }

  public didEncounterErrors(errors: GraphQLError[]) {
    this.treeBuilder.didEncounterErrors(errors);
  }
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
