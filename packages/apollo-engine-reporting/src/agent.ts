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
import { GraphQLRequestContext } from 'apollo-server-types';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { defaultEngineReportingSignature } from 'apollo-graphql';

export interface ClientInfo {
  clientName?: string;
  clientVersion?: string;
  clientReferenceId?: string;
}

export type SendValuesBaseOptions =
  | { onlyNames: Array<String> }
  | { exceptNames: Array<String> }
  | { all: true }
  | { none: true };

type VariableValueTransformOptions = {
  variables: Record<string, any>;
  operationString?: string;
};

export type VariableValueOptions =
  | {
      transform: (
        options: VariableValueTransformOptions,
      ) => Record<string, any>;
    }
  | SendValuesBaseOptions;

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
   * By default, Apollo Server does not send the values of any GraphQL variables to Apollo's servers, because variable
   * values often contain the private data of your app's users. If you'd like variable values to be included in traces, set this option.
   * This option can take several forms:
   * - { none: true }: don't send any variable values (DEFAULT)
   * - { all: true}: send all variable values
   * - { transform: ... }: a custom function for modifying variable values. Keys added by the custom function will
   *    be removed, and keys removed will be added back with an empty value. For security reasons, if an error occurs within this function, all variable values will be replaced with `[PREDICATE_FUNCTION_ERROR]`.
   * - { exceptNames: ... }: a case-sensitive list of names of variables whose values should not be sent to Apollo servers
   * - { onlyNames: ... }: A case-sensitive list of names of variables whose values will be sent to Apollo servers
   *
   * Defaults to not sending any variable values if both this parameter and
   * the deprecated `privateVariables` are not set. The report will
   * indicate each private variable key whose value was redacted by { none: true } or { exceptNames: [...] }.
   *
   * TODO(helen): Add new flag to the trace details (and modify the protobuf message structure) to indicate the type of modification. Then, add the following description to the docs:
   * "The report will indicate that variable values were modified by a custom function, or will list all private variables redacted."
   * TODO(helen): LINK TO EXAMPLE FUNCTION? e.g. a function recursively search for keys to be blocklisted
   */
  sendVariableValues?: VariableValueOptions;
  /**
   * [DEPRECATED] Use sendVariableValues
   * Passing an array into privateVariables is equivalent to passing { exceptNames: array } into
   * sendVariableValues, and passing in `true` or `false` is equivalent to passing { none: true } or
   * { all: true }, respectively.
   *
   * An error will be thrown if both this deprecated option and its replacement, sendVariableValues are defined.
   */
  privateVariables?: Array<String> | boolean;
  /**
   * By default, Apollo Server does not send the list of HTTP headers and values to
   * Apollo's servers, to protect private data of your app's users. If you'd like this information included in traces,
   * set this option. This option can take several forms:
   *
   * - { none: true } to drop all HTTP request headers (DEFAULT)
   * - { all: true } to send the values of all HTTP request headers
   * - { exceptNames: Array<String> } A case-insensitive list of names of HTTP headers whose values should not be
   *     sent to Apollo servers
   * - { onlyNames: Array<String> }: A case-insensitive list of names of HTTP headers whose values will be sent to Apollo servers
   *
   * Defaults to not sending any request header names and values if both this parameter and
   * the deprecated `privateHeaders` are not set.
   * Unlike with sendVariableValues, names of dropped headers are not reported.
   * The headers 'authorization', 'cookie', and 'set-cookie' are never reported.
   */
  sendHeaders?: SendValuesBaseOptions;
  /**
   * [DEPRECATED] Use sendHeaders
   * Passing an array into privateHeaders is equivalent to passing { exceptNames: array } into sendHeaders, and
   * passing `true` or `false` is equivalent to passing in { none: true } and { all: true }, respectively.
   *
   * An error will be thrown if both this deprecated option and its replacement, sendHeaders are defined.
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
  schemaHash: string;
  queryString?: string;
  documentAST?: DocumentNode;
}

const serviceHeaderDefaults = {
  hostname: os.hostname(),
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
  private reports: { [schemaHash: string]: FullTracesReport } = Object.create(
    null,
  );
  private reportSizes: { [schemaHash: string]: number } = Object.create(null);
  private reportTimer: any; // timer typing is weird and node-specific
  private sendReportsImmediately?: boolean;
  private stopped: boolean = false;
  private reportHeaders: { [schemaHash: string]: ReportHeader } = Object.create(
    null,
  );
  private signatureCache: InMemoryLRUCache<string>;

  private signalHandlers = new Map<NodeJS.Signals, NodeJS.SignalsListener>();

  public constructor(options: EngineReportingOptions<TContext> = {}) {
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

    this.sendReportsImmediately = options.sendReportsImmediately;
    if (!this.sendReportsImmediately) {
      this.reportTimer = setInterval(
        () => this.sendAllReportsAndReportErrors(),
        this.options.reportIntervalMs || 10 * 1000,
      );
    }

    if (this.options.handleSignals !== false) {
      const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
      signals.forEach(signal => {
        // Note: Node only started sending signal names to signal events with
        // Node v10 so we can't use that feature here.
        const handler: NodeJS.SignalsListener = async () => {
          this.stop();
          await this.sendAllReportsAndReportErrors();
          process.kill(process.pid, signal);
        };
        process.once(signal, handler);
        this.signalHandlers.set(signal, handler);
      });
    }

    // Handle the legacy options: privateVariables and privateHeaders
    handleLegacyOptions(this.options);
  }

  public newExtension(schemaHash: string): EngineReportingExtension<TContext> {
    return new EngineReportingExtension<TContext>(
      this.options,
      this.addTrace.bind(this),
      schemaHash,
    );
  }

  public async addTrace({
    trace,
    queryHash,
    documentAST,
    operationName,
    queryString,
    schemaHash,
  }: AddTraceArgs): Promise<void> {
    // Ignore traces that come in after stop().
    if (this.stopped) {
      return;
    }

    if (!(schemaHash in this.reports)) {
      this.reportHeaders[schemaHash] = new ReportHeader({
        ...serviceHeaderDefaults,
        schemaHash,
        schemaTag:
          this.options.schemaTag || process.env.ENGINE_SCHEMA_TAG || '',
      });
      // initializes this.reports[reportHash]
      this.resetReport(schemaHash);
    }
    const report = this.reports[schemaHash];

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
    if (!report.tracesPerQuery.hasOwnProperty(statsReportKey)) {
      report.tracesPerQuery[statsReportKey] = new Traces();
      (report.tracesPerQuery[statsReportKey] as any).encodedTraces = [];
    }
    // See comment on our override of Traces.encode inside of
    // apollo-engine-reporting-protobuf to learn more about this strategy.
    (report.tracesPerQuery[statsReportKey] as any).encodedTraces.push(
      encodedTrace,
    );
    this.reportSizes[schemaHash] +=
      encodedTrace.length + Buffer.byteLength(statsReportKey);

    // If the buffer gets big (according to our estimate), send.
    if (
      this.sendReportsImmediately ||
      this.reportSizes[schemaHash] >=
        (this.options.maxUncompressedReportSize || 4 * 1024 * 1024)
    ) {
      await this.sendReportAndReportErrors(schemaHash);
    }
  }

  public async sendAllReports(): Promise<void> {
    await Promise.all(
      Object.keys(this.reports).map(hash => this.sendReport(hash)),
    );
  }

  public async sendReport(schemaHash: string): Promise<void> {
    const report = this.reports[schemaHash];
    this.resetReport(schemaHash);

    if (Object.keys(report.tracesPerQuery).length === 0) {
      return;
    }

    // Send traces asynchronously, so that (eg) addTrace inside a resolver
    // doesn't block on it.
    await Promise.resolve();

    if (this.options.debugPrintReports) {
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
          throw new Error(
            `HTTP status ${curResponse.status}, ${(await curResponse.text()) ||
              '(no body)'}`,
          );
        } else {
          return curResponse;
        }
      },
      {
        retries: (this.options.maxAttempts || 5) - 1,
        minTimeout: this.options.minimumRetryDelayMs || 100,
        factor: 2,
      },
    ).catch((err: Error) => {
      throw new Error(
        `Error sending report to Apollo Engine servers: ${err.message}`,
      );
    });

    if (response.status < 200 || response.status >= 300) {
      // Note that we don't expect to see a 3xx here because request follows
      // redirects.
      throw new Error(
        `Error sending report to Apollo Engine servers: HTTP status ${
          response.status
        }, ${(await response.text()) || '(no body)'}`,
      );
    }
    if (this.options.debugPrintReports) {
      console.log(`Engine report: status ${response.status}`);
    }
  }

  // Stop prevents reports from being sent automatically due to time or buffer
  // size, and stop buffering new traces. You may still manually send a last
  // report by calling sendReport().
  public stop() {
    // Clean up signal handlers so they don't accrue indefinitely.
    this.signalHandlers.forEach((handler, signal) => {
      process.removeListener(signal, handler);
    });

    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = undefined;
    }

    this.stopped = true;
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

  private async sendAllReportsAndReportErrors(): Promise<void> {
    await Promise.all(
      Object.keys(this.reports).map(schemaHash =>
        this.sendReportAndReportErrors(schemaHash),
      ),
    );
  }

  private sendReportAndReportErrors(schemaHash: string): Promise<void> {
    return this.sendReport(schemaHash).catch(err => {
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

  private resetReport(schemaHash: string) {
    this.reports[schemaHash] = new FullTracesReport({
      header: this.reportHeaders[schemaHash],
    });
    this.reportSizes[schemaHash] = 0;
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

// Helper function to modify the EngineReportingOptions if the deprecated fields 'privateVariables' and 'privateHeaders'
// were set.
// - Throws an error if both the deprecated option and its replacement (e.g. 'privateVariables' and 'sendVariableValues') were set.
// - Otherwise, wraps the deprecated option into objects that can be passed to the new replacement field (see the helper
// function makeSendValuesBaseOptionsFromLegacy), and deletes the deprecated field from the options
export function handleLegacyOptions(
  options: EngineReportingOptions<any>,
): void {
  // Handle the legacy option: privateVariables
  if (
    typeof options.privateVariables !== 'undefined' &&
    options.sendVariableValues
  ) {
    throw new Error(
      "You have set both the 'sendVariableValues' and the deprecated 'privateVariables' options. Please only set 'sendVariableValues'.",
    );
  } else if (typeof options.privateVariables !== 'undefined') {
    if (options.privateVariables !== null) {
      options.sendVariableValues = makeSendValuesBaseOptionsFromLegacy(
        options.privateVariables,
      );
    }
    delete options.privateVariables;
  }

  // Handle the legacy option: privateHeaders
  if (typeof options.privateHeaders !== 'undefined' && options.sendHeaders) {
    throw new Error(
      "You have set both the 'sendHeaders' and the deprecated 'privateHeaders' options. Please only set 'sendHeaders'.",
    );
  } else if (typeof options.privateHeaders !== 'undefined') {
    if (options.privateHeaders !== null) {
      options.sendHeaders = makeSendValuesBaseOptionsFromLegacy(
        options.privateHeaders,
      );
    }
    delete options.privateHeaders;
  }
}

// This helper wraps non-null inputs from the deprecated options 'privateVariables' and 'privateHeaders' into
// objects that can be passed to the new replacement options, 'sendVariableValues' and 'sendHeaders'
function makeSendValuesBaseOptionsFromLegacy(
  legacyPrivateOption: Array<String> | boolean,
): SendValuesBaseOptions {
  return Array.isArray(legacyPrivateOption)
    ? {
        exceptNames: legacyPrivateOption,
      }
    : legacyPrivateOption
    ? { none: true }
    : { all: true };
}
