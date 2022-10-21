import type {
  BaseContext,
  HTTPGraphQLRequest,
  HTTPGraphQLResponse,
} from './externalTypes/index.js';
import type {
  ApolloServer,
  ApolloServerInternals,
  SchemaDerivedData,
} from './ApolloServer';
import { newHTTPGraphQLHead, runHttpQuery } from './runHttpQuery.js';
import { BadRequestError } from './internalErrorClasses.js';

export async function runBatchHttpQuery<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  batchRequest: HTTPGraphQLRequest,
  body: unknown[],
  contextValue: TContext,
  schemaDerivedData: SchemaDerivedData,
  internals: ApolloServerInternals<TContext>,
): Promise<HTTPGraphQLResponse> {
  if (body.length === 0) {
    throw new BadRequestError('No operations found in request.');
  }

  const combinedResponseHead = newHTTPGraphQLHead();
  const responseBodies = await Promise.all(
    body.map(async (bodyPiece: unknown) => {
      const singleRequest: HTTPGraphQLRequest = {
        ...batchRequest,
        body: bodyPiece,
      };

      const response = await runHttpQuery(
        server,
        singleRequest,
        contextValue,
        schemaDerivedData,
        internals,
      );

      if (response.body.kind === 'chunked') {
        throw Error(
          'Incremental delivery is not implemented for batch requests',
        );
      }
      for (const [key, value] of response.headers) {
        // Override any similar header set in other responses.
        combinedResponseHead.headers.set(key, value);
      }
      // If two responses both want to set the status code, one of them will win.
      // Note that the normal success case leaves status empty.
      if (response.status) {
        combinedResponseHead.status = response.status;
      }
      return response.body.string;
    }),
  );
  return {
    ...combinedResponseHead,
    body: { kind: 'complete', string: `[${responseBodies.join(',')}]` },
  };
}

export async function runPotentiallyBatchedHttpQuery<
  TContext extends BaseContext,
>(
  server: ApolloServer<TContext>,
  httpGraphQLRequest: HTTPGraphQLRequest,
  contextValue: TContext,
  schemaDerivedData: SchemaDerivedData,
  internals: ApolloServerInternals<TContext>,
): Promise<HTTPGraphQLResponse> {
  if (
    !(
      httpGraphQLRequest.method === 'POST' &&
      Array.isArray(httpGraphQLRequest.body)
    )
  ) {
    return await runHttpQuery(
      server,
      httpGraphQLRequest,
      contextValue,
      schemaDerivedData,
      internals,
    );
  }
  if (internals.allowBatchedHttpRequests) {
    return await runBatchHttpQuery(
      server,
      httpGraphQLRequest,
      httpGraphQLRequest.body as unknown[],
      contextValue,
      schemaDerivedData,
      internals,
    );
  }
  throw new BadRequestError('Operation batching disabled.');
}
