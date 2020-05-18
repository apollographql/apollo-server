import gql from 'graphql-tag';
import { GraphQLResolverMap } from 'apollo-graphql';

export const name = 'shipping';

export const typeDefs = gql`
  directive @stream on FIELD
  directive @transform(from: String!) on FIELD

  extend type ShippingInfo @key(fields: "") {
    height: Int @external
    width: Int @external
    length: Int @external
    weight: Int @external
    shippingCost: String @requires(fields: "height width length weight")
  }
`;

export const resolvers: GraphQLResolverMap<any> = {
  ShippingInfo: {
    shippingCost(object) {
      // cu. in. / 100
      const dimensionalCost = Math.round((object.width * object.height * object.length / 100) * 100) / 100;
      // $1 / lb
      const weightCost = Math.round(object.weight * 100) / 100;

      return Math.min(dimensionalCost, weightCost).toString();
    },
  },
};
