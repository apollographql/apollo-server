import gql from 'graphql-tag';
import { GraphQLSchemaValidationError } from 'apollo-graphql';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { DocumentNode, GraphQLSchema, GraphQLError, Kind } from 'graphql';

import { QueryPlan } from '../..';
import { buildQueryPlan, buildOperationContext, BuildQueryPlanOptions } from '../buildQueryPlan';
import { getFederatedTestingSchema } from './execution-utils';

const testDir = './packages/apollo-gateway/src/__tests__/';
const buildQueryPlanFeature = loadFeature(
  testDir + 'build-query-plan.feature'
);
const fragmentsFeature = loadFeature(testDir + 'integration/fragments.feature');
const requiresFeature = loadFeature(testDir + 'integration/requires.feature');

const features = [
  // buildQueryPlanFeature,
  // fragmentsFeature,
  requiresFeature
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

            const parsedExpectedPlan = JSON.parse(expectedQueryPlan);

            expect(queryPlan).toEqual(parsedExpectedPlan);
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
