import { Request } from 'apollo-server-env';

import {
  GraphQLResolveInfo,
  responsePathAsArray,
  ResponsePath,
  DocumentNode,
  ExecutionArgs,
  GraphQLError,
} from 'graphql';
import {
  GraphQLExtension,
  GraphQLResponse,
  EndHandler,
} from 'graphql-extensions';
import { Trace, google } from 'apollo-engine-reporting-protobuf';

import { EngineReportingOptions, GenerateClientInfo } from './agent';
import { defaultEngineReportingSignature } from 'apollo-graphql';
import { GraphQLRequestContext } from 'apollo-server-core/dist/requestPipelineAPI';

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
  public trace = new Trace();
  private nodes = new Map<string, Trace.Node>();
  private startHrTime!: [number, number];
  private operationName?: string;
  private queryString?: string;
  private documentAST?: DocumentNode;
  private options: EngineReportingOptions<TContext>;
  private addTrace: (
    signature: string,
    operationName: string,
    trace: Trace,
  ) => void;
  private generateClientInfo: GenerateClientInfo<TContext>;

  public constructor(
    options: EngineReportingOptions<TContext>,
    addTrace: (signature: string, operationName: string, trace: Trace) => void,
  ) {
    this.options = {
      maskErrorDetails: false,
      ...options,
    };
    this.addTrace = addTrace;
    const root = new Trace.Node();
    this.trace.root = root;
    this.nodes.set(responsePathAsString(undefined), root);
    this.generateClientInfo =
      options.generateClientInfo ||
      // Default to using the `apollo-client-x` header fields if present.
      // If none are present, fallback on the `clientInfo` query extension
      // for backwards compatibility.
      // The default value if neither header values nor query extension is
      // set is the empty String for all fields (as per protobuf defaults)
      (({ request }) => {
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
            clientReferenceId: request.http.headers.get(
              clientReferenceIdHeaderKey,
            ),
          };
        } else if (request.extensions && request.extensions.clientInfo) {
          return request.extensions.clientInfo;
        } else {
          return {};
        }
      });
  }

  public requestDidStart(o: {
    request: Request;
    queryString?: string;
    parsedQuery?: DocumentNode;
    variables?: Record<string, any>;
    persistedQueryHit?: boolean;
    persistedQueryRegister?: boolean;
    context: TContext;
    extensions?: Record<string, any>;
    requestContext: GraphQLRequestContext<TContext>;
  }): EndHandler {
    this.trace.startTime = dateToTimestamp(new Date());
    this.startHrTime = process.hrtime();

    // Generally, we'll get queryString here and not parsedQuery; we only get
    // parsedQuery if you're using an OperationStore. In normal cases we'll get
    // our documentAST in the execution callback after it is parsed.
    this.queryString = o.queryString;
    this.documentAST = o.parsedQuery;

    this.trace.http = new Trace.HTTP({
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
    if (this.options.privateHeaders !== true) {
      for (const [key, value] of o.request.headers) {
        if (
          this.options.privateHeaders &&
          Array.isArray(this.options.privateHeaders) &&
          // We assume that most users only have a few private headers, or will
          // just set privateHeaders to true; we can change this linear-time
          // operation if it causes real performance issues.
          this.options.privateHeaders.some(privateHeader => {
            // Headers are case-insensitive, and should be compared as such.
            return privateHeader.toLowerCase() === key.toLowerCase();
          })
        ) {
          continue;
        }

        switch (key) {
          case 'authorization':
          case 'cookie':
          case 'set-cookie':
            break;
          default:
            this.trace.http!.requestHeaders![key] = new Trace.HTTP.Values({
              value: [value],
            });
        }
      }

      if (o.persistedQueryHit) {
        this.trace.persistedQueryHit = true;
      }
      if (o.persistedQueryRegister) {
        this.trace.persistedQueryRegister = true;
      }
    }

    if (this.options.privateVariables !== true && o.variables) {
      // Note: we explicitly do *not* include the details.rawQuery field. The
      // Engine web app currently does nothing with this other than store it in
      // the database and offer it up via its GraphQL API, and sending it means
      // that using calculateSignature to hide sensitive data in the query
      // string is ineffective.
      this.trace.details = new Trace.Details();
      Object.keys(o.variables).forEach(name => {
        if (
          this.options.privateVariables &&
          Array.isArray(this.options.privateVariables) &&
          // We assume that most users will have only a few private variables,
          // or will just set privateVariables to true; we can change this
          // linear-time operation if it causes real performance issues.
          this.options.privateVariables.includes(name)
        ) {
          // Special case for private variables. Note that this is a different
          // representation from a variable containing the empty string, as that
          // will be sent as '""'.
          this.trace.details!.variablesJson![name] = '';
        } else {
          try {
            this.trace.details!.variablesJson![name] = JSON.stringify(
              o.variables![name],
            );
          } catch (e) {
            // This probably means that the value contains a circular reference,
            // causing `JSON.stringify()` to throw a TypeError:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Issue_with_JSON.stringify()_when_serializing_circular_references
            this.trace.details!.variablesJson![name] = JSON.stringify(
              '[Unable to convert value to JSON]',
            );
          }
        }
      });
    }

    const clientInfo = this.generateClientInfo(o.requestContext);
    if (clientInfo) {
      // While clientAddress could be a part of the protobuf, we'll ignore it for
      // now, since the backend does not group by it and Engine frontend will not
      // support it in the short term
      const { clientName, clientVersion, clientReferenceId } = clientInfo;
      // the backend makes the choice of mapping clientName => clientReferenceId if
      // no custom reference id is provided
      this.trace.clientVersion = clientVersion || '';
      this.trace.clientReferenceId = clientReferenceId || '';
      this.trace.clientName = clientName || '';
    }

    return () => {
      this.trace.durationNs = durationHrTimeToNanos(
        process.hrtime(this.startHrTime),
      );
      this.trace.endTime = dateToTimestamp(new Date());

      const operationName = this.operationName || '';
      let signature;
      if (this.documentAST) {
        const calculateSignature =
          this.options.calculateSignature || defaultEngineReportingSignature;
        signature = calculateSignature(this.documentAST, operationName);
      } else if (this.queryString) {
        // We didn't get an AST, possibly because of a parse failure. Let's just
        // use the full query string.
        //
        // XXX This does mean that even if you use a calculateSignature which
        //     hides literals, you might end up sending literals for queries
        //     that fail parsing or validation. Provide some way to mask them
        //     anyway?
        signature = this.queryString;
      } else {
        // This shouldn't happen: one of those options must be passed to runQuery.
        throw new Error('No queryString or parsedQuery?');
      }

      this.addTrace(signature, operationName, this.trace);
    };
  }

  public executionDidStart(o: { executionArgs: ExecutionArgs }) {
    // If the operationName is explicitly provided, save it. If there's just one
    // named operation, the client doesn't have to provide it, but we still want
    // to know the operation name so that the server can identify the query by
    // it without having to parse a signature.
    //
    // Fortunately, in the non-error case, we can just pull this out of
    // the first call to willResolveField's `info` argument.  In an
    // error case (eg, the operationName isn't found, or there are more
    // than one operation and no specified operationName) it's OK to continue
    // to file this trace under the empty operationName.
    if (o.executionArgs.operationName) {
      this.operationName = o.executionArgs.operationName;
    }
    this.documentAST = o.executionArgs.document;
  }

  public willResolveField(
    _source: any,
    _args: { [argName: string]: any },
    _context: TContext,
    info: GraphQLResolveInfo,
  ): ((error: Error | null, result: any) => void) | void {
    if (this.operationName === undefined) {
      this.operationName =
        (info.operation.name && info.operation.name.value) || '';
    }

    const path = info.path;
    const node = this.newNode(path);
    node.type = info.returnType.toString();
    node.parentType = info.parentType.toString();
    node.startTime = durationHrTimeToNanos(process.hrtime(this.startHrTime));

    return () => {
      node.endTime = durationHrTimeToNanos(process.hrtime(this.startHrTime));
      // We could save the error into the trace here, but it won't have all
      // the information that graphql-js adds to it later, like 'locations'.
    };
  }

  public willSendResponse(o: { graphqlResponse: GraphQLResponse }) {
    const { errors } = o.graphqlResponse;
    if (errors) {
      errors.forEach((error: GraphQLError) => {
        // By default, put errors on the root node.
        let node = this.nodes.get('');
        if (error.path) {
          const specificNode = this.nodes.get(error.path.join('.'));
          if (specificNode) {
            node = specificNode;
          }
        }

        // Always send the trace errors, so that the UI acknowledges that there is an error.
        const errorInfo = this.options.maskErrorDetails
          ? { message: '<masked>' }
          : {
              message: error.message,
              location: (error.locations || []).map(
                ({ line, column }) => new Trace.Location({ line, column }),
              ),
              json: JSON.stringify(error),
            };

        node!.error!.push(new Trace.Error(errorInfo));
      });
    }
  }

  private newNode(path: ResponsePath): Trace.Node {
    const node = new Trace.Node();
    const id = path.key;
    if (typeof id === 'number') {
      node.index = id;
    } else {
      node.fieldName = id;
    }
    this.nodes.set(responsePathAsString(path), node);
    const parentNode = this.ensureParentNode(path);
    parentNode.child.push(node);
    return node;
  }

  private ensureParentNode(path: ResponsePath): Trace.Node {
    const parentPath = responsePathAsString(path.prev);
    const parentNode = this.nodes.get(parentPath);
    if (parentNode) {
      return parentNode;
    }
    // Because we set up the root path in the constructor, we now know that
    // path.prev isn't undefined.
    return this.newNode(path.prev!);
  }
}

// Helpers for producing traces.

// Convert from the linked-list ResponsePath format to a dot-joined
// string. Includes the full path (field names and array indices).
function responsePathAsString(p: ResponsePath | undefined) {
  if (p === undefined) {
    return '';
  }
  return responsePathAsArray(p).join('.');
}

// Converts a JS Date into a Timestamp.
function dateToTimestamp(date: Date): google.protobuf.Timestamp {
  const totalMillis = +date;
  const millis = totalMillis % 1000;
  return new google.protobuf.Timestamp({
    seconds: (totalMillis - millis) / 1000,
    nanos: millis * 1e6,
  });
}

// Converts an hrtime array (as returned from process.hrtime) to nanoseconds.
//
// ONLY CALL THIS ON VALUES REPRESENTING DELTAS, NOT ON THE RAW RETURN VALUE
// FROM process.hrtime() WITH NO ARGUMENTS.
//
// The entire point of the hrtime data structure is that the JavaScript Number
// type can't represent all int64 values without loss of precision:
// Number.MAX_SAFE_INTEGER nanoseconds is about 104 days. Calling this function
// on a duration that represents a value less than 104 days is fine. Calling
// this function on an absolute time (which is generally roughly time since
// system boot) is not a good idea.
//
// XXX We should probably use google.protobuf.Duration on the wire instead of
// ever trying to store durations in a single number.
function durationHrTimeToNanos(hrtime: [number, number]) {
  return hrtime[0] * 1e9 + hrtime[1];
}
