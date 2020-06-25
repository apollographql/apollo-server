import os from 'os';
import { gzip } from 'zlib';
import {
  DocumentNode,
  GraphQLError,
  GraphQLSchema,
  printSchema,
} from 'graphql';
import {
  ReportHeader,
  Trace,
  Report,
  TracesAndStats,
} from 'apollo-engine-reporting-protobuf';

import { fetch, RequestAgent, Response } from 'apollo-server-env';
import retry from 'async-retry';

import { plugin } from './plugin';
import {
  GraphQLRequestContext,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextDidResolveOperation,
  Logger,
} from 'apollo-server-types';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { defaultEngineReportingSignature } from 'apollo-graphql';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { reportingLoop, SchemaReporter } from './schemaReporter';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

let warnedOnDeprecatedApiKey = false;

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

export type ReportTimingOptions<TContext> =
  | ((
      request:
        | GraphQLRequestContextDidResolveOperation<TContext>
        | GraphQLRequestContextDidEncounterErrors<TContext>,
    ) => Promise<boolean>)
  | boolean;

export type GenerateClientInfo<TContext> = (
  requestContext: GraphQLRequestContext<TContext>,
) => ClientInfo;

// AS3: Drop support for deprecated `ENGINE_API_KEY`.
export function getEngineApiKey({
  engine,
  skipWarn = false,
  logger = console,
}: {
  engine: EngineReportingOptions<any> | boolean | undefined;
  skipWarn?: boolean;
  logger?: Logger;
}) {
  if (typeof engine === 'object') {
    if (engine.apiKey) {
      return engine.apiKey;
    }
  }
  const legacyApiKeyFromEnv = process.env.ENGINE_API_KEY;
  const apiKeyFromEnv = process.env.APOLLO_KEY;

  if (legacyApiKeyFromEnv && apiKeyFromEnv && !skipWarn) {
    logger.warn(
      'Using `APOLLO_KEY` since `ENGINE_API_KEY` (deprecated) is also set in the environment.',
    );
  }
  if (legacyApiKeyFromEnv && !warnedOnDeprecatedApiKey && !skipWarn) {
    logger.warn(
      '[deprecated] The `ENGINE_API_KEY` environment variable has been renamed to `APOLLO_KEY`.',
    );
    warnedOnDeprecatedApiKey = true;
  }
  return apiKeyFromEnv || legacyApiKeyFromEnv || '';
}

// AS3: Drop support for deprecated `ENGINE_SCHEMA_TAG`.
export function getEngineGraphVariant(
  engine: EngineReportingOptions<any> | boolean | undefined,
  logger: Logger = console,
): string | undefined {
  if (engine === false) {
    return;
  } else if (
    typeof engine === 'object' &&
    (engine.graphVariant || engine.schemaTag)
  ) {
    if (engine.graphVariant && engine.schemaTag) {
      throw new Error(
        'Cannot set both engine.graphVariant and engine.schemaTag. Please use engine.graphVariant.',
      );
    }
    if (engine.schemaTag) {
      logger.warn(
        '[deprecated] The `schemaTag` property within `engine` configuration has been renamed to `graphVariant`.',
      );
    }
    return engine.graphVariant || engine.schemaTag;
  } else {
    if (process.env.ENGINE_SCHEMA_TAG) {
      logger.warn(
        '[deprecated] The `ENGINE_SCHEMA_TAG` environment variable has been renamed to `APOLLO_GRAPH_VARIANT`.',
      );
    }
    if (process.env.ENGINE_SCHEMA_TAG && process.env.APOLLO_GRAPH_VARIANT) {
      throw new Error(
        '`APOLLO_GRAPH_VARIANT` and `ENGINE_SCHEMA_TAG` (deprecated) environment variables must not both be set.',
      );
    }
    return process.env.APOLLO_GRAPH_VARIANT || process.env.ENGINE_SCHEMA_TAG;
  }
}

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
   * [DEPRECATED] this option was replaced by tracesEndpointUrl
   * The URL of the Engine report ingress server.
   */
  endpointUrl?: string;
  /**
   * The URL to the Apollo Graph Manager ingress endpoint.
   * (Previously, this was `endpointUrl`, which will be removed in AS3).
   */
  tracesEndpointUrl?: string;
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
   * This option allows configuring the behavior of request tracing and
   * reporting to [Apollo Graph Manager](https://engine.apollographql.com/).
   *
   * By default, this is set to `true`, which results in *all* requests being
   * traced and reported. This behavior can be _disabled_ by setting this option
   * to `false`. Alternatively, it can be selectively enabled or disabled on a
   * per-request basis using a predicate function.
   *
   * When specified as a predicate function, the _return value_ of its
   * invocation (per request) will determine whether or not that request is
   * traced and reported. The predicate function will receive the request
   * context. If validation and parsing of the request succeeds the function will
   * receive the request context in the
   * [`GraphQLRequestContextDidResolveOperation`](https://www.apollographql.com/docs/apollo-server/integrations/plugins/#didresolveoperation)
   * phase, which permits tracing based on dynamic properties, e.g., HTTP
   * headers or the `operationName` (when available),
   * otherwise it will receive the request context in the  [`GraphQLRequestContextDidEncounterError`](https://www.apollographql.com/docs/apollo-server/integrations/plugins/#didencountererrors)
   * phase:
   *
   * **Example:**
   *
   * ```js
   * reportTiming(requestContext) {
   *   // Always trace `query HomeQuery { ... }`.
   *   if (requestContext.operationName === "HomeQuery") return true;
   *
   *   // Also trace if the "trace" header is set to "true".
   *   if (requestContext.request.http?.headers?.get("trace") === "true") {
   *     return true;
   *   }
   *
   *   // Otherwise, do not trace!
   *   return false;
   * },
   * ```
   *
   */
  reportTiming?: ReportTimingOptions<TContext>;
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
   * [DEPRECATED: use graphVariant] A human readable name to tag this variant of a schema (i.e. staging, EU)
   */
  schemaTag?: string;
  /**
   * A human readable name to refer to the variant of the graph for which metrics are reported
   */
  graphVariant?: string;
  /**
   * Creates the client information for operation traces.
   */
  generateClientInfo?: GenerateClientInfo<TContext>;

  /**
   * Enable schema reporting from this server with Apollo Graph Manager.
   *
   * The use of this option avoids the need to register schemas manually within
   * CI deployment pipelines using `apollo schema:push` by periodically
   * reporting this server's schema (when changes are detected) along with
   * additional details about its runtime environment to Apollo Graph Manager.
   *
   * See [our _preview
   * documentation_](https://github.com/apollographql/apollo-schema-reporting-preview-docs)
   * for more information.
   */
  reportSchema?: boolean;

  /**
   * Override the reported schema that is reported to AGM.
   * This schema does not go through any normalizations and the string is directly sent to Apollo Graph Manager.
   * This would be useful for comments or other ordering and whitespace changes that get stripped when generating a `GraphQLSchema`
   */
  overrideReportedSchema?: string;

  /**
   * The schema reporter waits before starting reporting.
   * By default, the report waits some random amount of time between 0 and 10 seconds.
   * A longer interval leads to more staggered starts which means it is less likely
   * multiple servers will get asked to upload the same schema.
   *
   * If this server runs in lambda or in other constrained environments it would be useful
   * to decrease the schema reporting max wait time to be less than default.
   *
   * This number will be the max for the range in ms that the schema reporter will
   * wait before starting to report.
   */
  schemaReportingInitialDelayMaxMs?: number;

  /**
   * The URL to use for reporting schemas.
   */
  schemaReportingUrl?: string;

  /**
   * A logger interface to be used for output and errors.  When not provided
   * it will default to the server's own `logger` implementation and use
   * `console` when that is not available.
   */
  logger?: Logger;

  /**
   * @deprecated use {@link reportSchema} instead
   */
  experimental_schemaReporting?: boolean;

  /**
   * @deprecated use {@link overrideReportedSchema} instead
   */
  experimental_overrideReportedSchema?: string;

  /**
   * @deprecated use {@link schemaReportingInitialDelayMaxMs} instead
   */
  experimental_schemaReportingInitialDelayMaxMs?: number;
}

export interface AddTraceArgs {
  trace: Trace;
  operationName: string;
  queryHash: string;
  executableSchemaId: string;
  source?: string;
  document?: DocumentNode;
  logger: Logger;
}

const serviceHeaderDefaults = {
  hostname: os.hostname(),
  agentVersion: `apollo-engine-reporting@${require('../package.json').version}`,
  runtimeVersion: `node ${process.version}`,
  // XXX not actually uname, but what node has easily.
  uname: `${os.platform()}, ${os.type()}, ${os.release()}, ${os.arch()})`,
};

class ReportData {
  report!: Report;
  size!: number;
  readonly header: ReportHeader;
  constructor(executableSchemaId: string, graphVariant: string) {
    this.header = new ReportHeader({
      ...serviceHeaderDefaults,
      executableSchemaId,
      schemaTag: graphVariant,
    });
    this.reset();
  }
  reset() {
    this.report = new Report({ header: this.header });
    this.size = 0;
  }
}

// EngineReportingAgent is a persistent object which creates
// EngineReportingExtensions for each request and sends batches of trace reports
// to the Engine server.
export class EngineReportingAgent<TContext = any> {
  private readonly options: EngineReportingOptions<TContext>;
  private readonly apiKey: string;
  private readonly logger: Logger = console;
  private readonly graphVariant: string;

  private readonly reportDataByExecutableSchemaId: {
    [executableSchemaId: string]: ReportData | undefined;
  } = Object.create(null);

  private reportTimer: any; // timer typing is weird and node-specific
  private readonly sendReportsImmediately?: boolean;
  private stopped: boolean = false;
  private signatureCache: InMemoryLRUCache<string>;

  private signalHandlers = new Map<NodeJS.Signals, NodeJS.SignalsListener>();

  private currentSchemaReporter?: SchemaReporter;
  private readonly bootId: string;
  private lastSeenExecutableSchemaToId?: {
    executableSchema: string | GraphQLSchema;
    executableSchemaId: string;
  };

  private readonly tracesEndpointUrl: string;
  readonly schemaReport: boolean;

  public constructor(options: EngineReportingOptions<TContext> = {}) {
    this.options = options;
    this.apiKey = getEngineApiKey({
      engine: this.options,
      skipWarn: false,
      logger: this.logger,
    });
    if (options.logger) this.logger = options.logger;
    this.bootId = uuidv4();
    this.graphVariant = getEngineGraphVariant(options, this.logger) || '';

    if (!this.apiKey) {
      throw new Error(
        `To use EngineReportingAgent, you must specify an API key via the apiKey option or the APOLLO_KEY environment variable.`,
      );
    }

    if (options.experimental_schemaReporting !== undefined) {
      this.logger.warn(
        [
          '[deprecated] The "experimental_schemaReporting" option has been',
          'renamed to "reportSchema"'
        ].join(' ')
      );
      if (options.reportSchema === undefined) {
        options.reportSchema = options.experimental_schemaReporting;
      }
    }

    if (options.experimental_overrideReportedSchema !== undefined) {
      this.logger.warn(
        [
          '[deprecated] The "experimental_overrideReportedSchema" option has',
          'been renamed to "overrideReportedSchema"'
        ].join(' ')
      );
      if (options.overrideReportedSchema === undefined) {
        options.overrideReportedSchema = options.experimental_overrideReportedSchema;
      }
    }

    if (options.experimental_schemaReportingInitialDelayMaxMs !== undefined) {
      this.logger.warn(
        [
          '[deprecated] The "experimental_schemaReportingInitialDelayMaxMs"',
          'option has been renamed to "schemaReportingInitialDelayMaxMs"'
        ].join(' ')
      );
      if (options.schemaReportingInitialDelayMaxMs === undefined) {
        options.schemaReportingInitialDelayMaxMs = options.experimental_schemaReportingInitialDelayMaxMs;
      }
    }

    if (options.reportSchema !== undefined) {
      this.schemaReport = options.reportSchema;
    } else {
      this.schemaReport = process.env.APOLLO_SCHEMA_REPORTING === "true"
    }

    // Since calculating the signature for Engine reporting is potentially an
    // expensive operation, we'll cache the signatures we generate and re-use
    // them based on repeated traces for the same `queryHash`.
    this.signatureCache = createSignatureCache({ logger: this.logger });

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

    if (this.options.endpointUrl) {
      this.logger.warn(
        '[deprecated] The `endpointUrl` option within `engine` has been renamed to `tracesEndpointUrl`.',
      );
    }
    this.tracesEndpointUrl =
      (this.options.endpointUrl ||
        this.options.tracesEndpointUrl ||
        'https://engine-report.apollodata.com') + '/api/ingress/traces';

    // Handle the legacy options: privateVariables and privateHeaders
    handleLegacyOptions(this.options);
  }

  private executableSchemaIdGenerator(schema: string | GraphQLSchema) {
    if (this.lastSeenExecutableSchemaToId?.executableSchema === schema) {
      return this.lastSeenExecutableSchemaToId.executableSchemaId;
    }
    const id = computeExecutableSchemaId(schema);

    // We override this variable every time we get a new schema so we cache
    // the last seen value. It mostly a cached pair.
    this.lastSeenExecutableSchemaToId = {
      executableSchema: schema,
      executableSchemaId: id,
    };

    return id;
  }

  public newPlugin(): ApolloServerPlugin<TContext> {
    return plugin(this.options, this.addTrace.bind(this), {
      startSchemaReporting: this.startSchemaReporting.bind(this),
      executableSchemaIdGenerator: this.executableSchemaIdGenerator.bind(this),
      schemaReport: this.schemaReport,
    });
  }

  private getReportData(executableSchemaId: string): ReportData {
    const existing = this.reportDataByExecutableSchemaId[executableSchemaId];
    if (existing) {
      return existing;
    }
    const reportData = new ReportData(executableSchemaId, this.graphVariant);
    this.reportDataByExecutableSchemaId[executableSchemaId] = reportData;
    return reportData;
  }

  public async addTrace({
    trace,
    queryHash,
    document,
    operationName,
    source,
    executableSchemaId,
    /**
     * Since this agent instruments the plugin with its `options.logger`, but
     * also passes off a reference to this `addTrace` method which is invoked
     * with the availability of a per-request `logger`, this `logger` (in this
     * destructuring) is already conditionally either:
     *
     *   1. The `logger` that was passed into the `options` for the agent.
     *   2. The request-specific `logger`.
     */
    logger,
  }: AddTraceArgs): Promise<void> {
    // Ignore traces that come in after stop().
    if (this.stopped) {
      return;
    }

    const reportData = this.getReportData(executableSchemaId);
    const { report } = reportData;

    const protobufError = Trace.verify(trace);
    if (protobufError) {
      throw new Error(`Error encoding trace: ${protobufError}`);
    }
    const encodedTrace = Trace.encode(trace).finish();

    const signature = await this.getTraceSignature({
      queryHash,
      document,
      source,
      operationName,
      logger,
    });

    const statsReportKey = `# ${operationName || '-'}\n${signature}`;
    if (!report.tracesPerQuery.hasOwnProperty(statsReportKey)) {
      report.tracesPerQuery[statsReportKey] = new TracesAndStats();
      (report.tracesPerQuery[statsReportKey] as any).encodedTraces = [];
    }
    // See comment on our override of Traces.encode inside of
    // apollo-engine-reporting-protobuf to learn more about this strategy.
    (report.tracesPerQuery[statsReportKey] as any).encodedTraces.push(
      encodedTrace,
    );
    reportData.size += encodedTrace.length + Buffer.byteLength(statsReportKey);

    // If the buffer gets big (according to our estimate), send.
    if (
      this.sendReportsImmediately ||
      reportData.size >=
        (this.options.maxUncompressedReportSize || 4 * 1024 * 1024)
    ) {
      await this.sendReportAndReportErrors(executableSchemaId);
    }
  }

  public async sendAllReports(): Promise<void> {
    await Promise.all(
      Object.keys(this.reportDataByExecutableSchemaId).map(id =>
        this.sendReport(id),
      ),
    );
  }

  public async sendReport(executableSchemaId: string): Promise<void> {
    const reportData = this.getReportData(executableSchemaId);
    const { report } = reportData;
    reportData.reset();

    if (Object.keys(report.tracesPerQuery).length === 0) {
      return;
    }

    // Send traces asynchronously, so that (eg) addTrace inside a resolver
    // doesn't block on it.
    await Promise.resolve();

    if (this.options.debugPrintReports) {
      // In terms of verbosity, and as the name of this option suggests, this
      // message is either an "info" or a "debug" level message.  However,
      // we are using `warn` here for compatibility reasons since the
      // `debugPrintReports` flag pre-dated the existence of log-levels and
      // changing this to also require `debug: true` (in addition to
      // `debugPrintReports`) just to reach the level of verbosity to produce
      // the output would be a breaking change.  The "warn" level is on by
      // default.  There is a similar theory and comment applied below.
      this.logger.warn(
        `Engine sending report: ${JSON.stringify(report.toJSON())}`,
      );
    }

    const protobufError = Report.verify(report);
    if (protobufError) {
      throw new Error(`Error encoding report: ${protobufError}`);
    }
    const message = Report.encode(report).finish();

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

    // Wrap fetch with async-retry for automatic retrying
    const response: Response = await retry(
      // Retry on network errors and 5xx HTTP
      // responses.
      async () => {
        const curResponse = await fetch(this.tracesEndpointUrl, {
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
      // In terms of verbosity, and as the name of this option suggests, this
      // message is either an "info" or a "debug" level message.  However,
      // we are using `warn` here for compatibility reasons since the
      // `debugPrintReports` flag pre-dated the existence of log-levels and
      // changing this to also require `debug: true` (in addition to
      // `debugPrintReports`) just to reach the level of verbosity to produce
      // the output would be a breaking change.  The "warn" level is on by
      // default.  There is a similar theory and comment applied above.
      this.logger.warn(`Engine report: status ${response.status}`);
    }
  }

  public startSchemaReporting({
    executableSchemaId,
    executableSchema,
  }: {
    executableSchemaId: string;
    executableSchema: string;
  }) {
    this.logger.info('Starting schema reporter...');
    if (this.options.overrideReportedSchema !== undefined) {
      this.logger.info('Schema to report has been overridden');
    }
    if (this.options.schemaReportingInitialDelayMaxMs !== undefined) {
      this.logger.info(`Schema reporting max initial delay override: ${
        this.options.schemaReportingInitialDelayMaxMs
      } ms`);
    }
    if (this.options.schemaReportingUrl !== undefined) {
      this.logger.info(`Schema reporting URL override: ${
        this.options.schemaReportingUrl
      }`);
    }
    if (this.currentSchemaReporter) {
      this.currentSchemaReporter.stop();
    }

    const serverInfo = {
      bootId: this.bootId,
      graphVariant: this.graphVariant,
      // The infra environment in which this edge server is running, e.g. localhost, Kubernetes
      // Length must be <= 256 characters.
      platform: process.env.APOLLO_SERVER_PLATFORM || 'local',
      runtimeVersion: `node ${process.version}`,
      executableSchemaId: executableSchemaId,
      // An identifier used to distinguish the version of the server code such as git or docker sha.
      // Length must be <= 256 charecters
      userVersion: process.env.APOLLO_SERVER_USER_VERSION,
      // "An identifier for the server instance. Length must be <= 256 characters.
      serverId:
        process.env.APOLLO_SERVER_ID || process.env.HOSTNAME || os.hostname(),
      libraryVersion: `apollo-engine-reporting@${
        require('../package.json').version
      }`,
    };

    this.logger.info(
      `Schema reporting EdgeServerInfo: ${JSON.stringify(serverInfo)}`
    )

    // Jitter the startup between 0 and 10 seconds
    const delay = Math.floor(
      Math.random() *
        (this.options.schemaReportingInitialDelayMaxMs || 10_000),
    );

    const schemaReporter = new SchemaReporter(
      serverInfo,
      executableSchema,
      this.apiKey,
      this.options.schemaReportingUrl,
      this.logger
    );

    const fallbackReportingDelayInMs = 20_000;

    this.currentSchemaReporter = schemaReporter;
    const logger = this.logger;

    setTimeout(function() {
      reportingLoop(schemaReporter, logger, false, fallbackReportingDelayInMs);
    }, delay);
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

    if (this.currentSchemaReporter) {
      this.currentSchemaReporter.stop();
    }

    this.stopped = true;
  }

  private async getTraceSignature({
    queryHash,
    operationName,
    document,
    source,
    logger,
  }: {
    queryHash: string;
    operationName: string;
    document?: DocumentNode;
    source?: string;
    logger: Logger;
  }): Promise<string> {
    if (!document && !source) {
      // This shouldn't happen: one of those options must be passed to runQuery.
      throw new Error('No document or source?');
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

    if (!document) {
      // We didn't get an AST, possibly because of a parse failure. Let's just
      // use the full query string.
      //
      // XXX This does mean that even if you use a calculateSignature which
      //     hides literals, you might end up sending literals for queries
      //     that fail parsing or validation. Provide some way to mask them
      //     anyway?
      return source as string;
    }

    const generatedSignature = (
      this.options.calculateSignature || defaultEngineReportingSignature
    )(document, operationName);

    // Intentionally not awaited so the cache can be written to at leisure.
    //
    // As of the writing of this comment, this signature cache is exclusively
    // backed by an `InMemoryLRUCache` which cannot do anything
    // non-synchronously, though that will probably change in the future,
    // and a distributed cache store, like Redis, doesn't seem unfathomable.
    //
    // Due in part to the plugin being separate from the `EngineReportingAgent`,
    // the loggers are difficult to track down here.  Errors will be logged to
    // either the request-specific logger on the request context (if available)
    // or to the `logger` that was passed into `EngineReportingOptions` which
    // is provided in the `EngineReportingAgent` constructor options.
    this.signatureCache.set(cacheKey, generatedSignature).catch(err => {
      logger.warn(
        'Could not store signature cache. ' + (err && err.message) || err,
      );
    });

    return generatedSignature;
  }

  private async sendAllReportsAndReportErrors(): Promise<void> {
    await Promise.all(
      Object.keys(this.reportDataByExecutableSchemaId).map(executableSchemaId =>
        this.sendReportAndReportErrors(executableSchemaId),
      ),
    );
  }

  private sendReportAndReportErrors(executableSchemaId: string): Promise<void> {
    return this.sendReport(executableSchemaId).catch(err => {
      // This catch block is primarily intended to catch network errors from
      // the retried request itself, which include network errors and non-2xx
      // HTTP errors.
      if (this.options.reportErrorFunction) {
        this.options.reportErrorFunction(err);
      } else {
        this.logger.error(err.message);
      }
    });
  }
}

function createSignatureCache({
  logger,
}: {
  logger: Logger;
}): InMemoryLRUCache<string> {
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
        logger.warn(
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

export function computeExecutableSchemaId(
  schema: string | GraphQLSchema,
): string {
  // Can't call digest on this object twice. Creating new object each function call
  const sha256 = createHash('sha256');
  const schemaDocument =
    typeof schema === 'string' ? schema : printSchema(schema);
  return sha256.update(schemaDocument).digest('hex');
}
