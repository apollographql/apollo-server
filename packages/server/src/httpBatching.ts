import type {
  BaseContext,
  HTTPGraphQLRequest,
  HTTPGraphQLResponse,
} from './externalTypes';
import type {
  ApolloServer,
  ApolloServerInternals,
  SchemaDerivedData,
} from './ApolloServer';
import { HeaderMap, runHttpQuery } from './runHttpQuery.js';
import { BadRequestError } from './internalErrorClasses.js';

export async function runBatchHttpQuery<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  batchRequest: HTTPGraphQLRequest,
  body: unknown[],
  contextValue: TContext,
  schemaDerivedData: SchemaDerivedData,
  internals: ApolloServerInternals<TContext>,
): Promise<HTTPGraphQLResponse> {
  // TODO(AS4): Handle empty list as an error

  const combinedResponse: HTTPGraphQLResponse = {
    headers: new HeaderMap(),
    bodyChunks: null,
    completeBody: '',
  };
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

      if (response.completeBody === null) {
        // TODO(AS4): Implement incremental delivery or improve error handling.
        throw Error('Incremental delivery not implemented');
      }
      for (const [key, value] of response.headers) {
        // Override any similar header set in other responses.
        // TODO(AS4): this is what AS3 did but maybe this is silly
        combinedResponse.headers.set(key, value);
      }
      // If two responses both want to set the status code, one of them will win.
      // Note that the normal success case leaves status empty.
      if (response.status) {
        combinedResponse.status = response.status;
      }
      return response.completeBody;
    }),
  );
  combinedResponse.completeBody = `[${responseBodies.join(',')}]`;
  return combinedResponse;
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
  if (!Array.isArray(httpGraphQLRequest.body)) {
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
