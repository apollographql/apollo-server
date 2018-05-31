export {
  hideLiterals,
  dropUnusedDefinitions,
  sortAST,
  removeAliases,
  printWithReducedWhitespace,
  defaultSignature,
} from './signature';

import * as request from 'requestretry';

import {
  GraphQLResolveInfo,
  responsePathAsArray,
  ResponsePath,
  DocumentNode,
  ExecutionArgs,
} from 'graphql';
import { GraphQLExtension, EndHandler } from 'graphql-extensions';
import {
  FullTracesReport,
  ReportHeader,
  Traces,
  Trace,
  google,
} from 'apollo-engine-reporting-protobuf';
import { defaultSignature } from '.';

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

// XXX Implement details (variables, raw_query).
// XXX Implement client_*
// XXX Implement http request fields (requires access to Request)
// XXX Implement http response fields if feasible
// XXX Implement error tracking

export interface EngineReportingOptions {
  apiKey?: string;
  signature?: (ast: DocumentNode, operationName: string) => string;
  reportIntervalMs?: number;
  endpointUrl?: string;
  debugPrintReports?: boolean;
}

export class EngineReportingAgent<TContext = any> {
  private apiKey: string;
  private signature: (
    ast: DocumentNode,
    operationName: string,
  ) => string = defaultSignature;
  private endpointUrl: string = 'https://engine-report.apollodata.com';
  private header: ReportHeader;
  private report: FullTracesReport;
  private reportTimer: any;  // timer typing is weird and node-specific
  private debugPrintReports: boolean = false;

  public constructor(options: EngineReportingOptions = {}) {
    this.apiKey = options.apiKey || process.env.ENGINE_API_KEY || '';
    if (this.apiKey === '') {
      throw new Error(
        'To use EngineReportingAgent, you must specify an API key via the apiKey option or the ENGINE_API_KEY environment variable.',
      );
    }
    if (options.signature) {
      this.signature = options.signature;
    }
    if (options.endpointUrl) {
      this.endpointUrl = options.endpointUrl;
    }
    if (options.debugPrintReports) {
      this.debugPrintReports = options.debugPrintReports;
    }

    // XXX put stuff in the header
    this.header = new ReportHeader();

    this.report = new FullTracesReport({ header: this.header });

    this.reportTimer = setInterval(
      () => this.sendReport(),
      options.reportIntervalMs || 10 * 1000,
    );
  }

  public newExtension(): EngineReportingExtension<TContext> {
    return new EngineReportingExtension<TContext>(
      this.signature,
      this.addTrace.bind(this),
    );
  }

  public addTrace(signature: string, operationName: string, trace: Trace) {
    const statsReportKey = `# ${operationName || '-'}\n${signature}`;
    if (!this.report.tracesPerQuery.hasOwnProperty(statsReportKey)) {
      this.report.tracesPerQuery[statsReportKey] = new Traces();
    }
    this.report.tracesPerQuery[statsReportKey].trace!!.push(trace);
  }

  public async sendReport() {
    const report = this.report;
    this.report = new FullTracesReport({header:this.header});

    if (Object.keys(report.tracesPerQuery).length === 0) {
      return;
    }

    if (this.debugPrintReports) {
      // tslint:disable-next-line no-console
      console.log("Engine sending report:", report.toJSON());
    }

    const protobufError = FullTracesReport.verify(report);
    if (protobufError) {
      throw new Error(`Error encoding report: ${protobufError}`);
    }
    const message = FullTracesReport.encode(report).finish();

    // note: retryrequest has built-in Promise support, unlike the base'request'.
    console.log(await request({
      url: this.endpointUrl + '/api/ingress/traces',
      method: 'POST',
      headers: {
        'user-agent': 'apollo-engine-reporting',
        'x-api-key': this.apiKey,
      },
      body: message,
      // XXX allow these constants to be tweaked
      maxAttempts: 5,
      retryDelay: 100,
      // XXX support corp proxies, or does request do that for us now?
    }));  // FIXME remove log
  }

  // XXX flush on exit/SIGINT/etc?
  public async flush() {
    this.stop();
    await this.sendReport();
  }

  public stop() {
    clearInterval(this.reportTimer);
    this.reportTimer = undefined;
  }
}

// Exported primarily for testing.
// XXX move to a separate file and don't export publicly?
export class EngineReportingExtension<TContext = any>
  implements GraphQLExtension<TContext> {
  public trace = new Trace();
  private nodes = new Map<string, Trace.Node>();
  private startHrTime: [number, number];
  private operationName: string;
  private queryString: string;
  private documentAST: DocumentNode;
  private calculateSignature: (
    ast: DocumentNode,
    operationName: string,
  ) => string;
  private addTrace: (
    signature: string,
    operationName: string,
    trace: Trace,
  ) => void;

  public constructor(
    calculateSignature: (ast: DocumentNode, operationName: string) => string,
    addTrace: (
      signature: string,
      operationName: string,
      trace: Trace,
    ) => void,
  ) {
    this.calculateSignature = calculateSignature;
    this.addTrace = addTrace;
    const root = new Trace.Node();
    this.trace.root = root;
    this.nodes.set(responsePathAsString(undefined), root);
  }

  public parsingDidStart(o: { queryString: string }) {
    this.queryString = o.queryString;
  }

  public requestDidStart(o: { request: Request }): EndHandler {
    this.trace.startTime = dateToTimestamp(new Date());
    this.startHrTime = process.hrtime();
    return () => {
      this.trace.durationNs = durationHrTimeToNanos(
        process.hrtime(this.startHrTime),
      );
      this.trace.endTime = dateToTimestamp(new Date());

      const operationName = this.operationName || '';
      let signature;
      if (this.documentAST) {
        signature = this.calculateSignature(this.documentAST, operationName);
      } else if (this.queryString) {
        // We didn't get an AST, possibly because of a parse failure. Let's just
        // use the full query string.
        //
        // XXX This does mean that even if you use a calculateSignature which
        //     hides literals, you might end up sending literals for queries
        //     that fail to execute. Provide some way to mask them anyway?
        signature = this.queryString;
      } else {
        // This probably only happens if you're using an OperationStore and you
        // put something that doesn't pass validation in it.
        //
        // XXX We could add more hooks to apollo-server to get the documentAST
        //     in that case but this feels pretty marginal.
        signature = 'query unknown { unknown }';
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

  public willResolveField?(
    source: any,
    args: { [argName: string]: any },
    context: TContext,
    info: GraphQLResolveInfo,
  ): ((result: any) => void) | void {
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
    };
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
