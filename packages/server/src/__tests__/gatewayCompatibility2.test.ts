import { ApolloServer } from '..';

import { ApolloGateway as AG2OldestSupported } from 'apollo-gateway-2-oldest-supported';
import { ApolloGateway as AG2BeforeASGI } from 'apollo-gateway-2-before-asgi';
import { ApolloGateway as AG2Latest } from 'apollo-gateway-2-latest';
import { it } from '@jest/globals';

it('can construct an ApolloServer with oldest supported @apollo/gateway 2.x', () => {
  new ApolloServer({ gateway: new AG2OldestSupported() });
});

// Last 2.x version that depends on AS3 rather than @apollo/server-gateway-interface.
it('can construct an ApolloServer with last @apollo/gateway 2.x before @apollo/server-gateway-interface', () => {
  new ApolloServer({ gateway: new AG2BeforeASGI() });
});

it('can construct an ApolloServer with latest @apollo/gateway 2.x', () => {
  new ApolloServer({ gateway: new AG2Latest() });
});
