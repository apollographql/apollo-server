import os from 'os';
import { gzip } from 'zlib';
import { DocumentNode, GraphQLError } from 'graphql';
import {
  FullTracesReport,
  ReportHeader,
  Traces,
  Trace,
} from 'apollo-engine-reporting-protobuf';

import { fetch, RequestAgent, Response } from 'apollo-server-env';
import retry from 'async-retry';

import { EngineReportingExtension } from './extension';
import {
  GraphQLRequestContext,
  GraphQLServiceContext,
} from 'apollo-server-core/dist/requestPipelineAPI';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { defaultEngineReportingSignature } from 'apollo-graphql';

export interface ClientInfo {
  clientName?: string;
  clientVersion?: string;
  clientReferenceId?: string;
}

export type GenerateClientInfo<TContext> = (
  requestContext: GraphQLRequestContext<TContext>,
) => ClientInfo;

export interface EngineReportingOptions<TContext> {
  /**
   * API key for the service. Get this from
   * [Engine](https://engine.apollographql.com) by logging in and creating
   * a service. You may also specify this with the `ENGINE_API_KEY`
   * environment variable; the option takes precedence. __Required__.
   */
  apiKey?: string;
  /**
   * Specify the function for creating a signature for a query. See signature.ts
   * for details.
   */
  calculateSignature?: (ast: DocumentNode, operationName: string) => string;
  /**
   * How often to send reports to the Engine server. We'll also send reports
   * when the report gets big; see maxUncompressedReportSize.
   */
  reportIntervalMs?: number;
  /**
   * We send a report when the report size will become bigger than this size in
   * bytes (default: 4MB).  (This is a rough limit --- we ignore the size of the
   * report header and some other top level bytes. We just add up the lengths of
   * the serialized traces and signatures.)
   */
  maxUncompressedReportSize?: number;
  /**
   * The URL of the Engine report ingress server.
   */
  endpointUrl?: string;
  /**
   * If set, prints all reports as JSON when they are sent.
   */
  debugPrintReports?: boolean;
  /**
   * HTTP(s) agent to be used on the fetch call to apollo-engine metrics endpoint
   */
  requestAgent?: RequestAgent | false;
  /**
   * Reporting is retried with exponential backoff up to this many times
   * (including the original request). Defaults to 5.
   */
  maxAttempts?: number;
  /**
   * Minimum back-off for retries. Defaults to 100ms.
   */
  minimumRetryDelayMs?: number;
  /**
   * By default, errors that occur when sending trace reports to Engine servers
   * will be logged to standard error. Specify this function to process errors
   * in a different way.
   */
  reportErrorFunction?: (err: Error) => void;
  /**
   * A case-sensitive list of names of variables whose values should not be sent
   * to Apollo servers, or 'true' to leave out all variables. In the former
   * case, the report will indicate that each private variable was redacted; in
   * the latter case, no variables are sent at all.
   */
  privateVariables?: Array<String> | boolean;
  /**
   * A case-insensitive list of names of HTTP headers whose values should not be
   * sent to Apollo servers, or 'true' to leave out all HTTP headers. Unlike
   * with privateVariables, names of dropped headers are not reported.
   */
  privateHeaders?: Array<String> | boolean;
  /**
   * By default, EngineReportingAgent listens for the 'SIGINT' and 'SIGTERM'
   * signals, stops, sends a final report, and re-sends the signal to
   * itself. Set this to false to disable. You can manually invoke 'stop()' and
   * 'sendReport()' on other signals if you'd like. Note that 'sendReport()'
   * does not run synchronously so it cannot work usefully in an 'exit' handler.
   */
  handleSignals?: boolean;
  /**
   * Sends the trace report immediately. This options is useful for stateless environments
   */
  sendReportsImmediately?: boolean;
  /**
   * @deprecated Use `rewriteError` instead.
   * @default false
   *
   * To remove the error message from traces, set this to true.
   */
  maskErrorDetails?: boolean;
  /**
   * By default, all errors get reported to Engine servers. You can specify a
   * a filter function to exclude specific errors from being reported by
   * returning an explicit `null`, or you can mask certain details of the error
   * by modifying it and returning the modified error.
   */
  rewriteError?: (err: GraphQLError) => GraphQLError | null;
  /**
   * A human readable name to tag this variant of a schema (i.e. staging, EU)
   */
  schemaTag?: string;
  /**
   * Creates the client information for operation traces.
   */
  generateClientInfo?: GenerateClientInfo<TContext>;
}

export interface AddTraceArgs {
  trace: Trace;
  operationName: string;
  queryHash: string;
  queryString?: string;
  documentAST?: DocumentNode;
}

const serviceHeaderDefaults = {
  hostname: os.hostname(),
  // tslint:disable-next-line no-var-requires
  agentVersion: `apollo-engine-reporting@${require('../package.json').version}`,
  runtimeVersion: `node ${process.version}`,
  // XXX not actually uname, but what node has easily.
  uname: `${os.platform()}, ${os.type()}, ${os.release()}, ${os.arch()})`,
};

// EngineReportingAgent is a persistent object which creates
// EngineReportingExtensions for each request and sends batches of trace reports
// to the Engine server.
export class EngineReportingAgent<TContext = any> {
  private options: EngineReportingOptions<TContext>;
  private apiKey: string;
  private report!: FullTracesReport;
  private reportSize!: number;
  private reportTimer: any; // timer typing is weird and node-specific
  private sendReportsImmediately?: boolean;
  private stopped: boolean = false;
  private reportHeader: ReportHeader;
  private signatureCache: InMemoryLRUCache<string>;

  public constructor(
    options: EngineReportingOptions<TContext> = {},
    { schemaHash }: GraphQLServiceContext,
  ) {
    this.options = options;
    this.apiKey = options.apiKey || process.env.ENGINE_API_KEY || '';
    if (!this.apiKey) {
      throw new Error(
        'To use EngineReportingAgent, you must specify an API key via the apiKey option or the ENGINE_API_KEY environment variable.',
      );
    }

    // Since calculating the signature for Engine reporting is potentially an
    // expensive operation, we'll cache the signatures we generate and re-use
    // them based on repeated traces for the same `queryHash`.
    this.signatureCache = createSignatureCache();

    this.reportHeader = new ReportHeader({
      ...serviceHeaderDefaults,
      schemaHash,
      schemaTag: options.schemaTag || process.env.ENGINE_SCHEMA_TAG || '',
    });
    this.resetReport();

    this.sendReportsImmediately = options.sendReportsImmediately;
    if (!this.sendReportsImmediately) {
      this.reportTimer = setInterval(
        () => this.sendReportAndReportErrors(),
        this.options.reportIntervalMs || 10 * 1000,
      );
    }

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

  private async getTraceSignature({
    queryHash,
    operationName,
    documentAST,
    queryString,
  }: {
    queryHash: string;
    operationName: string;
    documentAST?: DocumentNode;
    queryString?: string;
  }): Promise<string> {
    if (!documentAST && !queryString) {
      // This shouldn't happen: one of those options must be passed to runQuery.
      throw new Error('No queryString or parsedQuery?');
    }

    const cacheKey = signatureCacheKey(queryHash, operationName);

    // If we didn't have the signature in the cache, we'll resort to
    // calculating it asynchronously.  The `addTrace` method will
    // `await` the `signature` if it's a Promise, prior to putting it
    // on the stack of traces to deliver to the cloud.
    const cachedSignature = await this.signatureCache.get(cacheKey);

    if (cachedSignature) {
      return cachedSignature;
    }

    if (!documentAST) {
      // We didn't get an AST, possibly because of a parse failure. Let's just
      // use the full query string.
      //
      // XXX This does mean that even if you use a calculateSignature which
      //     hides literals, you might end up sending literals for queries
      //     that fail parsing or validation. Provide some way to mask them
      //     anyway?
      return queryString as string;
    }

    const generatedSignature = (this.options.calculateSignature ||
      defaultEngineReportingSignature)(documentAST, operationName);

    // Intentionally not awaited so the cache can be written to at leisure.
    this.signatureCache.set(cacheKey, generatedSignature);

    return generatedSignature;
  }

  public async addTrace({
    trace,
    queryHash,
    documentAST,
    operationName,
    queryString,
  }: AddTraceArgs): Promise<void> {
    // Ignore traces that come in after stop().
    if (this.stopped) {
      return;
    }

    const protobufError = Trace.verify(trace);
    if (protobufError) {
      throw new Error(`Error encoding trace: ${protobufError}`);
    }
    const encodedTrace = Trace.encode(trace).finish();

    const signature = await this.getTraceSignature({
      queryHash,
      documentAST,
      queryString,
      operationName,
    });

    const statsReportKey = `# ${operationName || '-'}\n${signature}`;
    if (!this.report.tracesPerQuery.hasOwnProperty(statsReportKey)) {
      this.report.tracesPerQuery[statsReportKey] = new Traces();
      (this.report.tracesPerQuery[statsReportKey] as any).encodedTraces = [];
    }
    // See comment on our override of Traces.encode inside of
    // apollo-engine-reporting-protobuf to learn more about this strategy.
    (this.report.tracesPerQuery[statsReportKey] as any).encodedTraces.push(
      encodedTrace,
    );
    this.reportSize += encodedTrace.length + Buffer.byteLength(statsReportKey);

    // If the buffer gets big (according to our estimate), send.
    if (
      this.sendReportsImmediately ||
      this.reportSize >=
        (this.options.maxUncompressedReportSize || 4 * 1024 * 1024)
    ) {
      await this.sendReportAndReportErrors();
    }
  }

  public async sendReport(): Promise<void> {
    const report = this.report;
    this.resetReport();

    if (Object.keys(report.tracesPerQuery).length === 0) {
      return;
    }

    // Send traces asynchronously, so that (eg) addTrace inside a resolver
    // doesn't block on it.
    await Promise.resolve();

    if (this.options.debugPrintReports) {
      // tslint:disable-next-line no-console
      console.log(`Engine sending report: ${JSON.stringify(report.toJSON())}`);
    }

    const protobufError = FullTracesReport.verify(report);
    if (protobufError) {
      throw new Error(`Error encoding report: ${protobufError}`);
    }
    const message = FullTracesReport.encode(report).finish();

    const compressed = await new Promise<Buffer>((resolve, reject) => {
      // The protobuf library gives us a Uint8Array. Node 8's zlib lets us
      // pass it directly; convert for the sake of Node 6. (No support right
      // now for Node 4, which lacks Buffer.from.)
      const messageBuffer = Buffer.from(
        message.buffer as ArrayBuffer,
        message.byteOffset,
        message.byteLength,
      );
      gzip(messageBuffer, (err, gzipResult) => {
        if (err) {
          reject(err);
        } else {
          resolve(gzipResult);
        }
      });
    });

    const endpointUrl =
      (this.options.endpointUrl || 'https://engine-report.apollodata.com') +
      '/api/ingress/traces';

    // Wrap fetch with async-retry for automatic retrying
    const response: Response = await retry(
      // Retry on network errors and 5xx HTTP
      // responses.
      async () => {
        const curResponse = await fetch(endpointUrl, {
          method: 'POST',
          headers: {
            'user-agent': 'apollo-engine-reporting',
            'x-api-key': this.apiKey,
            'content-encoding': 'gzip',
          },
          body: compressed,
          agent: this.options.requestAgent,
        });

        if (curResponse.status >= 500 && curResponse.status < 600) {
          throw new Error(`${curResponse.status}: ${curResponse.statusText}`);
        } else {
          return curResponse;
        }
      },
      {
        retries: this.options.maxAttempts || 5,
        minTimeout: this.options.minimumRetryDelayMs || 100,
        factor: 2,
      },
    ).catch((err: Error) => {
      throw new Error(`Error sending report to Apollo Engine servers: ${err}`);
    });

    if (response.status < 200 || response.status >= 300) {
      // Note that we don't expect to see a 3xx here because request follows
      // redirects.
      throw new Error(
        `Error sending report to Apollo Engine servers (HTTP status ${
          response.status
        }): ${await response.text()}`,
      );
    }
    if (this.options.debugPrintReports) {
      // tslint:disable-next-line no-console
      console.log(`Engine report: status ${response.status}`);
    }
  }

  // Stop prevents reports from being sent automatically due to time or buffer
  // size, and stop buffering new traces. You may still manually send a last
  // report by calling sendReport().
  public stop() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = undefined;
    }

    this.stopped = true;
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
    this.report = new FullTracesReport({ header: this.reportHeader });
    this.reportSize = 0;
  }
}

function createSignatureCache(): InMemoryLRUCache<string> {
  let lastSignatureCacheWarn: Date;
  let lastSignatureCacheDisposals: number = 0;
  return new InMemoryLRUCache<string>({
    // Calculate the length of cache objects by the JSON.stringify byteLength.
    sizeCalculator(obj) {
      return Buffer.byteLength(JSON.stringify(obj), 'utf8');
    },
    // 3MiB limit, very much approximately since we can't be sure how V8 might
    // be storing these strings internally. Though this should be enough to
    // store a fair amount of operation signatures (~10000?), depending on their
    // overall complexity. A future version of this might expose some
    // configuration option to grow the cache, but ideally, we could do that
    // dynamically based on the resources available to the server, and not add
    // more configuration surface area. Hopefully the warning message will allow
    // us to evaluate the need with more validated input from those that receive
    // it.
    maxSize: Math.pow(2, 20) * 3,
    onDispose() {
      // Count the number of disposals between warning messages.
      lastSignatureCacheDisposals++;

      // Only show a message warning about the high turnover every 60 seconds.
      if (
        !lastSignatureCacheWarn ||
        new Date().getTime() - lastSignatureCacheWarn.getTime() > 60000
      ) {
        // Log the time that we last displayed the message.
        lastSignatureCacheWarn = new Date();
        console.warn(
          [
            'This server is processing a high number of unique operations.  ',
            `A total of ${lastSignatureCacheDisposals} records have been `,
            'ejected from the Engine Reporting signature cache in the past ',
            'interval.  If you see this warning frequently, please open an ',
            'issue on the Apollo Server repository.',
          ].join(''),
        );

        // Reset the disposal counter for the next message interval.
        lastSignatureCacheDisposals = 0;
      }
    },
  });
}

export function signatureCacheKey(queryHash: string, operationName: string) {
  return `${queryHash}${operationName && ':' + operationName}`;
}
