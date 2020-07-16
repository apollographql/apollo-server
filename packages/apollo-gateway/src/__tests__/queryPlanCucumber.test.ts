import gql from 'graphql-tag';
import { GraphQLSchemaValidationError } from 'apollo-graphql';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { DocumentNode } from 'graphql';

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
        let operationDocument: DocumentNode;
        let operationString: string;
        let queryPlan: QueryPlan;
        let options: BuildQueryPlanOptions = { autoFragmentization: false };

        const { schema, errors, queryPlannerPointer } = getFederatedTestingSchema();

        if (errors && errors.length > 0) {
          throw new GraphQLSchemaValidationError(errors);
        }

        const givenQuery = () => {
          given(/^query$/im, (operation: string) => {
            operationDocument = gql(operation);
            operationString = operation;
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
              buildOperationContext({
                schema,
                operationDocument,
                operationString,
                queryPlannerPointer,
              }),
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
