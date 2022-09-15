import { ApolloServer } from '..';

import { ApolloGateway as AG0OldestSupported } from 'apollo-gateway-0-oldest-supported';
import { ApolloGateway as AG0BeforeASGI } from 'apollo-gateway-0-before-asgi';
import { ApolloGateway as AG0Latest } from 'apollo-gateway-0-latest';
import { it } from '@jest/globals';

// This is the oldest version which prints no peer dep warnings when installed
// with graphql-js@16; it's possible that some older versions could work as
// well. (Definitely nothing older than 0.35.0, which adds
// onSchemaLoadOrUpdate.).
it('can construct an ApolloServer with oldest supported @apollo/gateway 0.x', () => {
  new ApolloServer({ gateway: new AG0OldestSupported() });
});

// Last 0.x version that depends on AS3 rather than @apollo/server-gateway-interface.
it('can construct an ApolloServer with last @apollo/gateway 0.x before @apollo/server-gateway-interface', () => {
  new ApolloServer({ gateway: new AG0BeforeASGI() });
});

it('can construct an ApolloServer with latest @apollo/gateway 0.x', () => {
  new ApolloServer({ gateway: new AG0Latest() });
});
