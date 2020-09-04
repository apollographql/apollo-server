import gql from 'graphql-tag';
import { GraphQLResolverMap } from 'apollo-graphql';

export const name = 'colour-footballs';
export const url = `https://${name}.api.com`;
export const typeDefs = gql`

  directive @stream on FIELD
  directive @transform(from: String!) on FIELD

  extend interface Football @key(fields: "upc") @key(fields: "sku") {
    colour: String
  }

  extend type IndoorFootball @key(fields: "upc") @key(fields: "sku") {
    upc: String! @external
    sku: String! @external
    colour: String
  }

  extend type OutdoorFootball @key(fields: "upc") @key(fields: "sku") {
    upc: String! @external
    sku: String! @external
    weight: Int @external
    colour: String
    heavy: Boolean @requires(fields: "weight")
  }
`

export const resolvers: GraphQLResolverMap<any> = {
  Football: {
    __resolveReference(object) {
      return colouredFootballs.find(
        colouredFootball =>
          colouredFootball.upc === object.upc ||
          colouredFootball.sku === object.sku
      )
    },
  },
  OutdoorFootball: {
    __resolveReference(object) {
      return colouredFootballs.find(
        colouredFootball =>
          colouredFootball.upc === object.upc ||
          colouredFootball.sku === object.sku
      )
    },
    heavy(object) {
      return (object.weight > 10)
    }
  },
  IndoorFootball: {
    __resolveReference(object) {
      return colouredFootballs.find(
        colouredFootball =>
          colouredFootball.upc === object.upc ||
          colouredFootball.sku === object.sku
      )
    },
  }
}

const colouredFootballs = [
  { __typename: 'OutdoorFootball',
    upc: '100',
    sku: 'FOOTBALL1',
    colour: 'black'
  },
  { __typename: 'OutdoorFootball',
    upc: '200',
    sku: 'FOOTBALL2',
    colour: 'white'
  },
  { __typename: 'IndoorFootball',
    upc: '300',
    sku: 'FOOTBALL3',
    colour: 'orange'

  },
  { __typename: 'IndoorFootball',
    upc: '400',
    sku: 'FOOTBALL4',
    colour: 'yellow'
  }
]
