import * as os from 'os';
import { gzip } from 'zlib';
import * as request from 'requestretry';
import { DocumentNode } from 'graphql';
import {
  FullTracesReport,
  ReportHeader,
  Traces,
  Trace,
} from 'apollo-engine-reporting-protobuf';

import { EngineReportingExtension } from './extension';

// Override the generated protobuf Traces.encode function so that it will look
// for Traces that are already encoded to Buffer as well as unencoded
// Traces. This amortizes the protobuf encoding time over each generated Trace
// instead of bunching it all up at once at sendReport time. In load tests, this
// change improved p99 end-to-end HTTP response times by a factor of 11 without
// a casually noticeable effect on p50 times. This also makes it easier for us
// to implement maxUncompressedReportSize as we know the encoded size of traces
// as we go.
const originalTracesEncode = Traces.encode;
Traces.encode = function(message, originalWriter) {
  const writer = originalTracesEncode(message, originalWriter);
  const encodedTraces = (message as any).encodedTraces;
  if (encodedTraces != null && encodedTraces.length) {
    for (let i = 0; i < encodedTraces.length; ++i) {
      writer.uint32(/* id 1, wireType 2 =*/ 10);
      writer.bytes(encodedTraces[i]);
    }
  }
  return writer;
};

export interface EngineReportingOptions {
  // API key for the service. Get this from
  // [Engine](https://engine.apollographql.com) by logging in and creating
  // a service. You may also specify this with the `ENGINE_API_KEY`
  // environment variable; the option takes precedence. __Required__.
  apiKey?: string;
  // Specify the function for creating a signature for a query. See signature.ts
  // for details.
  calculateSignature?: (ast: DocumentNode, operationName: string) => string;
  // How often to send reports to the Engine server. We'll also send reports
  // when the report gets big; see maxUncompressedReportSize.
  reportIntervalMs?: number;
  // We send a report when the report size will become bigger than this size in
  // bytes (default: 4MB).  (This is a rough limit --- we ignore the size of the
  // report header and some other top level bytes. We just add up the lengths of
  // the serialized traces and signatures.)
  maxUncompressedReportSize?: number;
  // The URL of the Engine report ingress server.
  endpointUrl?: string;
  // If set, prints all reports as JSON when they are sent.
  debugPrintReports?: boolean;
  // Reporting is retried with exponential backoff up to this many times
  // (including the original request). Defaults to 5.
  maxAttempts?: number;
  // Minimum backoff for retries. Defaults to 100ms.
  minimumRetryDelayMs?: number;
  // By default, errors sending reports to Engine servers will be logged
  // to standard error. Specify this function to process errors in a different
  // way.
  reportErrorFunction?: (err: Error) => void;
  // A case-sensitive list of names of variables whose values should not be sent
  // to Apollo servers, or 'true' to leave out all variables. In the former
  // case, the report will indicate that each private variable was redacted; in
  // the latter case, no variables are sent at all.
  privateVariables?: Array<String> | boolean;
  // A case-insensitive list of names of HTTP headers whose values should not be
  // sent to Apollo servers, or 'true' to leave out all HTTP headers. Unlike
  // with privateVariables, names of dropped headers are not reported.
  privateHeaders?: Array<String> | boolean;
  // By default, EngineReportingAgent listens for the 'SIGINT' and 'SIGTERM'
  // signals, stops, sends a final report, and re-sends the signal to
  // itself. Set this to false to disable. You can manually invoke 'stop()' and
  // 'sendReport()' on other signals if you'd like. Note that 'sendReport()'
  // does not run synchronously so it cannot work usefully in an 'exit' handler.
  handleSignals?: boolean;

  // XXX Provide a way to set client_name, client_version, client_address,
  // service, and service_version fields. They are currently not revealed in the
  // Engine frontend app.
}

const REPORT_HEADER = new ReportHeader({
  hostname: os.hostname(),
  // tslint:disable-next-line no-var-requires
  agentVersion: `apollo-engine-reporting@${require('../package.json').version}`,
  runtimeVersion: `node ${process.version}`,
  // XXX not actually uname, but what node has easily.
  uname: `${os.platform()}, ${os.type()}, ${os.release()}, ${os.arch()})`,
});

// EngineReportingAgent is a persistent object which creates
// EngineReportingExtensions for each request and sends batches of trace reports
// to the Engine server.
export class EngineReportingAgent<TContext = any> {
  private options: EngineReportingOptions;
  private apiKey: string;
  private report!: FullTracesReport;
  private reportSize!: number;
  private reportTimer: any; // timer typing is weird and node-specific

  public constructor(options: EngineReportingOptions = {}) {
    this.options = options;
    this.apiKey = options.apiKey || process.env.ENGINE_API_KEY || '';
    if (!this.apiKey) {
      throw new Error(
        'To use EngineReportingAgent, you must specify an API key via the apiKey option or the ENGINE_API_KEY environment variable.',
      );
    }

    this.resetReport();

    this.reportTimer = setInterval(
      () => this.sendReportAndReportErrors(),
      this.options.reportIntervalMs || 10 * 1000,
    );

    if (this.options.handleSignals !== false) {
      const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
      signals.forEach(signal => {
        process.once(signal, async () => {
          this.stop();
          await this.sendReportAndReportErrors();
          process.kill(process.pid, signal);
        });
      });
    }
  }

  public newExtension(): EngineReportingExtension<TContext> {
    return new EngineReportingExtension<TContext>(
      this.options,
      this.addTrace.bind(this),
    );
  }

  public addTrace(signature: string, operationName: string, trace: Trace) {
    // Ignore traces that come in after stop().
    if (!this.reportTimer) {
      return;
    }

    const protobufError = Trace.verify(trace);
    if (protobufError) {
      throw new Error(`Error encoding trace: ${protobufError}`);
    }
    const encodedTrace = Trace.encode(trace).finish();

    const statsReportKey = `# ${operationName || '-'}\n${signature}`;
    if (!this.report.tracesPerQuery.hasOwnProperty(statsReportKey)) {
      this.report.tracesPerQuery[statsReportKey] = new Traces();
      (this.report.tracesPerQuery[statsReportKey] as any).encodedTraces = [];
    }
    // See comment on our override of Traces.encode to learn more about this
    // strategy.
    (this.report.tracesPerQuery[statsReportKey] as any).encodedTraces.push(
      encodedTrace,
    );
    this.reportSize += encodedTrace.length + Buffer.byteLength(statsReportKey);

    // If the buffer gets big (according to our estimate), send.
    if (
      this.reportSize >=
      (this.options.maxUncompressedReportSize || 4 * 1024 * 1024)
    ) {
      this.sendReportAndReportErrors();
    }
  }

  public sendReport(): Promise<void> {
    const report = this.report;
    this.resetReport();

    if (Object.keys(report.tracesPerQuery).length === 0) {
      return Promise.resolve();
    }

    // Send traces asynchronously, so that (eg) addTrace inside a resolver
    // doesn't block on it.
    return Promise.resolve()
      .then(() => {
        if (this.options.debugPrintReports) {
          // tslint:disable-next-line no-console
          console.log(
            `Engine sending report: ${JSON.stringify(report.toJSON())}`,
          );
        }

        const protobufError = FullTracesReport.verify(report);
        if (protobufError) {
          throw new Error(`Error encoding report: ${protobufError}`);
        }
        const message = FullTracesReport.encode(report).finish();

        return new Promise((resolve, reject) => {
          // The protobuf library gives us a Uint8Array. Node 8's zlib lets us
          // pass it directly; convert for the sake of Node 6. (No support right
          // now for Node 4, which lacks Buffer.from.)
          const messageBuffer = Buffer.from(
            message.buffer as ArrayBuffer,
            message.byteOffset,
            message.byteLength,
          );
          gzip(messageBuffer, (err, compressed) => {
            if (err) {
              reject(err);
            } else {
              resolve(compressed);
            }
          });
        });
      })
      .then(compressed => {
        // Grab this here because the delayStrategy function has a different 'this'.
        const minimumRetryDelayMs = this.options.minimumRetryDelayMs || 100;

        // note: retryrequest has built-in Promise support, unlike the base 'request'.
        return (request({
          url:
            (this.options.endpointUrl ||
              'https://engine-report.apollodata.com') + '/api/ingress/traces',
          method: 'POST',
          headers: {
            'user-agent': 'apollo-engine-reporting',
            'x-api-key': this.apiKey,
            'content-encoding': 'gzip',
          },
          body: compressed,
          // By default, retryrequest will retry on network errors and 5xx HTTP
          // responses.
          maxAttempts: this.options.maxAttempts || 5,
          // Note: use a non-arrow function as this API gives us useful information
          // on 'this', and use an 'as any' because the type definitions don't know
          // about the function version of this parameter.
          delayStrategy: function() {
            return Math.pow(minimumRetryDelayMs * 2, this.attempts);
          },
          // XXX Back in Optics, we had an explicit proxyUrl option for corporate
          //     proxies. I was never clear on why `request`'s handling of the
          //     standard env vars wasn't good enough (see
          //     https://github.com/apollographql/optics-agent-js/pull/70#discussion_r89374066).
          //     We may have to add it here.

          // Include 'as any's because @types/requestretry doesn't understand the
          // promise API or delayStrategy.
        } as any) as any).catch((err: Error) => {
          throw new Error(`Error sending report to Engine servers: ${err}`);
        });
      })
      .then(response => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          // Note that we don't expect to see a 3xx here because request follows
          // redirects.
          throw new Error(
            `Error sending report to Engine servers (HTTP status ${
              response.statusCode
            }): ${response.body}`,
          );
        }
        if (this.options.debugPrintReports) {
          // tslint:disable-next-line no-console
          console.log(`Engine report: status ${response.statusCode}`);
        }
      });
  }

  // Stop prevents reports from being sent automatically due to time or buffer
  // size, and stop buffering new traces. You may still manually send a last
  // report by calling sendReport().
  public stop() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = undefined;
    }
  }

  private sendReportAndReportErrors(): Promise<void> {
    return this.sendReport().catch(err => {
      // This catch block is primarily intended to catch network errors from
      // the retried request itself, which include network errors and non-2xx
      // HTTP errors.
      if (this.options.reportErrorFunction) {
        this.options.reportErrorFunction(err);
      } else {
        console.error(err.message);
      }
    });
  }

  private resetReport() {
    this.report = new FullTracesReport({ header: REPORT_HEADER });
    this.reportSize = 0;
  }
}
