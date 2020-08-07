import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  GraphQLRequestContext
} from "apollo-server-plugin-base";
import { ApolloError } from "apollo-server-errors";
import loglevel from "loglevel";
import { PluginDefinition } from "apollo-server-core";

interface Options {
  debug?: boolean;
  enforceOperationNaming?: boolean;
  enforceClientNaming?: boolean;
  enforceClientVersion?: boolean;
  clientNameHeader?: string;
  clientVersionHeader?: string;
}

export default function StrictOperationsPlugin(options: Options = Object.create(null)) {
  let enforceOperationNaming = options.enforceOperationNaming || true;
  let enforceClientNaming = options.enforceClientNaming || true;
  let enforceClientVersion = options.enforceClientVersion || true;

  let clientNameHeader = options.clientNameHeader || 'apollographql-client-name';
  let clientVersionHeader = options.clientVersionHeader || "apollographql-client-version";

  const logger = loglevel.getLogger(`apollo-server:strict-operations-plugin`);
  if (options.debug === true) logger.enableAll();

  Object.freeze(options);

  return (): ApolloServerPlugin => ({
    requestDidStart(requestContext: GraphQLRequestContext): GraphQLRequestListener<any> {
      let clientName = requestContext.request.http?.headers.get(clientNameHeader);
      let clientVersion = requestContext.request.http?.headers.get(clientVersionHeader);

      if (enforceClientNaming && !clientName) {
        logger.debug(`Operation has no identified client`);

        throw new ApolloError("Execution denied: Operation has no identified client");
      }

      if (enforceClientVersion && !clientVersion) {
        logger.debug(`Client version is not identified for ${clientName}`);

        throw new ApolloError(`Client version is not identified for ${clientName}`);
      }

      return {
        parsingDidStart({ queryHash, request }) {
          if (enforceOperationNaming && !request.operationName) {
            logger.debug(`Unnamed Operation: ${queryHash}`);

            let error = new ApolloError("Execution denied: Unnamed operation");
            Object.assign(error.extensions, {
              queryHash: queryHash,
              clientName: clientName,
              clientVersion: clientVersion,
              exception: {
                message: `All operations must be named`
              }
            });

            throw error;
          }
        }
      };
    }
  });
}
