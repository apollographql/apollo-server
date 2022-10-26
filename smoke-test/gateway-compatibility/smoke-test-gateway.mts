import { ApolloServer } from '@apollo/server';
import { ApolloGateway } from '@apollo/gateway';

new ApolloServer({ gateway: new ApolloGateway() });
