import gql from 'graphql-tag';
import path from 'path';
import {
  GraphQLSchemaModule,
  GraphQLSchemaValidationError,
} from 'apollo-graphql';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { DocumentNode, GraphQLSchema, GraphQLError } from 'graphql';
import { composeServices, buildFederatedSchema, normalizeTypeDefs } from '@apollo/federation';

import { QueryPlan } from '../..';
import { LocalGraphQLDataSource } from '../datasources/LocalGraphQLDataSource';
import { buildQueryPlan, buildOperationContext } from '../buildQueryPlan';

const buildQueryPlanFeature = loadFeature(
  './packages/apollo-gateway/src/__tests__/build-query-plan.feature'
);


const features = [
  buildQueryPlanFeature
];

function buildLocalService(modules: GraphQLSchemaModule[]) {
  const schema = buildFederatedSchema(modules);
  return new LocalGraphQLDataSource(schema);
}

features.forEach((feature) => {
  defineFeature(feature, (test) => {
    feature.scenarios.forEach((scenario) => {
      test(scenario.title, async ({ given, when, then }) => {
        let query: DocumentNode;
        let schema: GraphQLSchema;
        let errors: GraphQLError[];
        let queryPlan: QueryPlan;
        let options: any = {};

        const serviceMap = Object.fromEntries(
          ['accounts', 'product', 'inventory', 'reviews', 'books', 'documents'].map(
            serviceName => {
              return [
                serviceName,
                buildLocalService([
                  require(path.join(
                    __dirname,
                    '__fixtures__/schemas',
                    serviceName,
                  )),
                ]),
              ] as [string, LocalGraphQLDataSource];
            },
          ),
        );

        ({ schema, errors } = composeServices(
          Object.entries(serviceMap).map(([serviceName, service]) => ({
            name: serviceName,
            typeDefs: normalizeTypeDefs(service.sdl()),
          })),
        ));

        if (errors && errors.length > 0) {
          throw new GraphQLSchemaValidationError(errors);
        }

        const givenQuery = () => {
          given(/^query$/im, (operation) => {
            query = gql(operation)
          })
        }

        const whenUsingAutoFragmentization = () => {
          when(/using autofragmentization/i, () => {
            options = { autoFragmentization: true };
          })
        }

        const thenQueryPlanShouldBe = () => {
          then(/^query plan$/i, (expectedQueryPlan) => {
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
          if (/^query$/i.test(stepText)) givenQuery();
          else if (/using autofragmentization/i.test(stepText)) whenUsingAutoFragmentization();
          else if (/^query plan$/i.test(stepText)) thenQueryPlanShouldBe();
          else throw new Error('Invalid steps in .feature file');
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
      return undefined;
    case "kind":
      if(v === "SelectionSet") return undefined;
      return v;
    case "variableUsages":
      // TODO check this
      return Object.keys(v);
    case "typeCondition":
      return v.name.value;
    case "name":
      return v.value;
    case "requires":
      return v && v.selections ? v.selections : undefined;
    default:
      return v;
  }
}
