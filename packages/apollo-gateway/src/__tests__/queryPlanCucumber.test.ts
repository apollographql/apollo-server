import gql from 'graphql-tag';
import { GraphQLSchemaValidationError } from 'apollo-graphql';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { DocumentNode, GraphQLSchema, GraphQLError, Kind } from 'graphql';

import { QueryPlan } from '../..';
import { buildQueryPlan, buildOperationContext, BuildQueryPlanOptions } from '../buildQueryPlan';
import { getFederatedTestingSchema } from './execution-utils';

const buildQueryPlanFeature = loadFeature(
  './packages/apollo-gateway/src/__tests__/build-query-plan.feature'
);


const features = [
  buildQueryPlanFeature
];

features.forEach((feature) => {
  defineFeature(feature, (test) => {
    feature.scenarios.forEach((scenario) => {
      test(scenario.title, async ({ given, when, then }) => {
        let query: DocumentNode;
        let queryPlan: QueryPlan;
        let options: BuildQueryPlanOptions = { autoFragmentization: false };

        const { schema, errors } = getFederatedTestingSchema();

        if (errors && errors.length > 0) {
          throw new GraphQLSchemaValidationError(errors);
        }

        const givenQuery = () => {
          given(/^query$/im, (operation: string) => {
            query = gql(operation)
          })
        }

        const whenUsingAutoFragmentization = () => {
          when(/using autofragmentization/i, () => {
            options = { autoFragmentization: true };
          })
        }

        const thenQueryPlanShouldBe = () => {
          then(/^query plan$/i, (expectedQueryPlan: string) => {
            queryPlan = buildQueryPlan(
              buildOperationContext(schema, query, undefined),
              options
            );

            const serializedPlan = JSON.parse(JSON.stringify(queryPlan, serializeQueryPlanNode));
            const parsedExpectedPlan = JSON.parse(expectedQueryPlan);

            expect(serializedPlan).toEqual(parsedExpectedPlan);
          })
        }

        // step over each defined step in the .feature and execute the correct
        // matching step fn defined above
        scenario.steps.forEach(({ stepText }) => {
          const title = stepText.toLocaleLowerCase();
          if (title === "query") givenQuery();
          else if (title === "using autofragmentization") whenUsingAutoFragmentization();
          else if (title === "query plan") thenQueryPlanShouldBe();
          else throw new Error(`Unrecognized steps used in "build-query-plan.feature"`);
        });
      });
    });
  });
});

const serializeQueryPlanNode = (k: string , v: any) => {
  switch(k){
    case "selectionSet":
    case "internalFragments":
    case "loc":
    case "arguments":
    case "directives":
    case "source":
      return undefined;
    case "kind":
      if(v === Kind.SELECTION_SET) return undefined;
      return v;
    case "variableUsages":
      // TODO check this
      return Object.keys(v);
    case "typeCondition":
      return v.name.value;
    case "name":
      return v.value;
    case "requires":
      return v?.selections;
    default:
      // replace source with operation
      if(v?.kind === "Fetch"){
        return { ...v, operation: v.source };
      }
      // replace selectionSet with selections[]
      if(v?.kind === Kind.INLINE_FRAGMENT){
        return { ...v, selections: v.selectionSet.selections }
      }
      return v;
  }
}
