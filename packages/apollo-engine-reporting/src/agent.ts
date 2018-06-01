import { EngineReportingExtension } from './extension';

import * as request from 'requestretry';

import { DocumentNode } from 'graphql';
import {
  FullTracesReport,
  ReportHeader,
  Traces,
  Trace,
} from 'apollo-engine-reporting-protobuf';
import { defaultSignature } from './signature';

export interface EngineReportingOptions {
  apiKey?: string;
  signature?: (ast: DocumentNode, operationName: string) => string;
  reportIntervalMs?: number;
  endpointUrl?: string;
  debugPrintReports?: boolean;
}

// EngineReportingAgent is a persistent object which creates
// EngineReportingExtensions for each request and sends batches of trace reports
// to the Engine server.
export class EngineReportingAgent<TContext = any> {
  private apiKey: string;
  private signature: (
    ast: DocumentNode,
    operationName: string,
  ) => string = defaultSignature;
  private endpointUrl: string = 'https://engine-report.apollodata.com';
  private header: ReportHeader;
  private report: FullTracesReport;
  private reportTimer: any; // timer typing is weird and node-specific
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

    // XXX trace report size and send when big
  }

  public async sendReport() {
    const report = this.report;
    this.report = new FullTracesReport({ header: this.header });

    if (Object.keys(report.tracesPerQuery).length === 0) {
      return;
    }

    if (this.debugPrintReports) {
      // tslint:disable-next-line no-console
      console.log(`Engine sending report: ${JSON.stringify(report.toJSON())}`);
    }

    const protobufError = FullTracesReport.verify(report);
    if (protobufError) {
      throw new Error(`Error encoding report: ${protobufError}`);
    }
    const message = FullTracesReport.encode(report).finish();

    // note: retryrequest has built-in Promise support, unlike the base'request'.
    const response = (await request({
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
    })) as any; // @types/requestretry doesn't understand its promise API

    if (this.debugPrintReports) {
      // tslint:disable-next-line no-console
      console.log(`Engine report: status ${response.statusCode}`);
    }
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
