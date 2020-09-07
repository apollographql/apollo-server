import gql from 'graphql-tag';
import { buildOperationContext, buildQueryPlan } from '../../';
import { GraphQLError, GraphQLSchema } from "graphql";
import { getFederatedTestingSchema } from "../execution-utils";
import {optimiseEntityFetchInlineFragments} from "../../executeQueryPlan";

describe('ApolloGateway _entities optimisation', () => {
  let schema: GraphQLSchema;
  let errors: GraphQLError[];

  beforeEach(() => {
    ({ schema, errors } = getFederatedTestingSchema());
    expect(errors).toHaveLength(0);
  });

  it('removes unnecessary inline fragments', async () => {

    const query = gql`
      query {
        footballs(where: { size: { GTE: 4 } }) {
          __typename
          sku
          material
          colour
          size
        }
      }
    `;

    const context = buildOperationContext(schema, query, undefined);
    const queryPlan = buildQueryPlan(context);
    const _entitiesFetch = queryPlan.node.nodes[1].node
    const representations = [
      {__typename: 'OutdoorFootball', upc: '200'}
    ]
    // Before optimisation
    const unoptimisedEntitiesQuery: string = "query($representations:[_Any!]!){" +
    "_entities(representations:$representations){" +
    "...on OutdoorFootball{colour}" +
    "...on IndoorFootball{colour}" +
    "...on NightFootball{colour}" +
    "...on VisuallyImpairedFootball{colour}}}"

    expect(_entitiesFetch.source).toMatch(unoptimisedEntitiesQuery)

    // After optimisation
    const optimisedQuery: string = "query($representations:[_Any!]!){" +
      "_entities(representations:$representations){" +
      "...on OutdoorFootball{colour}}}"

    expect(optimiseEntityFetchInlineFragments(representations, _entitiesFetch)
      .source).toMatch(optimisedQuery)

  }
}
