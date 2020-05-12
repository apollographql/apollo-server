// Fields required for the trial related emails
import {
  ReportServerInfoVariables,
  EdgeServerInfo,
  AutoregReportServerInfoResult,
} from './reportingOperationTypes';
import { fetch, Headers, Request } from 'apollo-server-env';
import { GraphQLRequest, Logger } from 'apollo-server-types';

const reportServerInfoGql = `
  mutation ReportServerInfo($info: EdgeServerInfo!, $executableSchema: String) {
    me {
      __typename
      ... on ServiceMutation {
        reportServerInfo(info: $info, executableSchema: $executableSchema) {
          inSeconds
          withExecutableSchema
        }
      }
    }
  }
`;

class ReportingError extends Error {}

export function reportingLoop(
  schemaReporter: SchemaReporter,
  logger: Logger,
  sendNextWithExecutableSchema: boolean,
  fallbackReportingDelayInMs: number,
) {
  function inner() {
    // Bail out permanently
    if (schemaReporter.stopped()) return;

    schemaReporter
      .reportServerInfo(sendNextWithExecutableSchema)
      .then(({ inSeconds, withExecutableSchema }) => {
        sendNextWithExecutableSchema = withExecutableSchema;
        setTimeout(inner, inSeconds * 1000);
      })
      .catch((error: any) => {
        // In the case of an error we want to continue looping
        // We can add hardcoded backoff in the future,
        // or on repeated failures stop responding reporting.
        logger.warn(`Error in reportingServerInfo: ${error}`);
        sendNextWithExecutableSchema = false;
        setTimeout(inner, fallbackReportingDelayInMs);
      });
  }

  inner();
}

interface ReportServerInfoReturnVal {
  inSeconds: number;
  withExecutableSchema: boolean;
}

// This class is meant to be a thin shim around the gql mutations.
export class SchemaReporter {
  // These mirror the gql variables
  private readonly serverInfo: EdgeServerInfo;
  private readonly executableSchemaDocument: any;
  private readonly url: string;

  private isStopped: boolean;
  private readonly headers: Headers;

  constructor(
    serverInfo: EdgeServerInfo,
    schemaSdl: string,
    apiKey: string,
    reportingEndpoint: string | undefined,
  ) {
    if (apiKey === '') {
      throw new Error('No api key defined');
    }

    this.headers = new Headers();
    this.headers.set('Content-Type', 'application/json');
    this.headers.set('x-api-key', apiKey);

    this.url =
      reportingEndpoint ||
      'https://engine-graphql.apollographql.com/api/graphql';

    this.serverInfo = serverInfo;
    this.executableSchemaDocument = schemaSdl;
    this.isStopped = false;
  }

  public stopped(): Boolean {
    return this.isStopped;
  }

  public stop() {
    this.isStopped = true;
  }

  public async reportServerInfo(
    withExecutableSchema: boolean,
  ): Promise<ReportServerInfoReturnVal> {
    const { data, errors } = await this.graphManagerQuery({
      info: this.serverInfo,
      executableSchema: withExecutableSchema
        ? this.executableSchemaDocument
        : null,
    } as ReportServerInfoVariables);

    if (errors) {
      throw new ReportingError(
        (errors || []).map((x: any) => x.message).join('\n'),
      );
    }

    if (!data || !data.me || !data.me.__typename) {
      throw new ReportingError(`
Heartbeat response error. Received incomplete data from Apollo graph manager.
If this continues please reach out at support@apollographql.com.
Got response: "${JSON.stringify(data)}"
      `);
    }

    if (data.me.__typename == 'UserMutation') {
      this.isStopped = true;
      throw new ReportingError(`
      User tokens cannot be used for schema reporting. Only service tokens.
      `);
    } else if (data.me.__typename == 'ServiceMutation') {
      if (!data.me.reportServerInfo) {
        throw new ReportingError(`
Heartbeat response error. Received incomplete data from Apollo graph manager.
If this continues please reach out at support@apollographql.com.
Got response: "${JSON.stringify(data)}"
      `);
      }
      return data.me.reportServerInfo;
    } else {
      throw new ReportingError(`
Unexpected response. Received unexpected data from Apollo Graph Manager
If this continues please reach out at support@apollographql.com.
Got response: "${JSON.stringify(data)}"
      `);
    }
  }

  private async graphManagerQuery(
    variables: ReportServerInfoVariables,
  ): Promise<AutoregReportServerInfoResult> {
    const request: GraphQLRequest = {
      query: reportServerInfoGql,
      operationName: 'ReportServerInfo',
      variables: variables,
    };
    const httpRequest = new Request(this.url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });
    const httpResponse = await fetch(httpRequest);
    return httpResponse.json();
  }
}
