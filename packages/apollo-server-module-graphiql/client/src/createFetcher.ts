import { split, execute } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { setContext } from 'apollo-link-context';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getMainDefinition } from 'apollo-utilities';
import gql from 'graphql-tag';

function isSubscription(gqlOperation) {
  const { kind, operation } = getMainDefinition(gqlOperation.query);
  return kind === `OperationDefinition` && operation === `subscription`;
}

export function createFetcher({
  endpointURL,
  subscriptionsEndpoint,
  websocketConnectionParams,
  httpHeaders
}) {
  const isWsEndpoint = endpointURL.startsWith('ws://') || endpointURL.startsWith('wss://');
  let link = null;
  let wsLink = null;
  let httpLink = null;

  if (!isWsEndpoint) {
    httpLink = new HttpLink({ uri: endpointURL });

    if (httpHeaders) {
      const contextLink = setContext(() => (<any>Object).assign({}, httpHeaders));
      httpLink = contextLink.concat(httpLink);
    }
  }

  if (isWsEndpoint || subscriptionsEndpoint) {
    const subscriptionClient = new SubscriptionClient(isWsEndpoint ? endpointURL : subscriptionsEndpoint, {
      reconnect: true,
      connectionParams: websocketConnectionParams
    });
    wsLink = new WebSocketLink(subscriptionClient);
  }

  if (httpLink && wsLink) {
    link = split(isSubscription, wsLink, httpLink);
  } else {
    link = wsLink || httpLink;
  }

  if (!link) {
    throw new Error(`Missing endpointURL`);
  }

  return operation => execute(link, (<any>Object).assign({}, operation, { query: gql`${operation.query}` }));
}
