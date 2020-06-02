import gql from 'graphql-tag';
import { execute, ServiceDefinitionModule } from '../execution-utils';

import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

import { defineFeature, loadFeature } from 'jest-cucumber';
import { DocumentNode } from 'graphql';
import { GraphQLExecutionResult } from 'apollo-server-types';
import { QueryPlan } from '../..';

import { astSerializer, queryPlanSerializer } from '../../snapshotSerializers';
import prettyFormat from 'pretty-format';

const providesFeature = loadFeature(
  './packages/apollo-gateway/src/__tests__/integration/provides.feature',
);
const abstractTypesFeature = loadFeature(
  './packages/apollo-gateway/src/__tests__/integration/abstract-types.feature',
);

let serviceFixtures: { [key: string]: ServiceDefinitionModule } = {
  accounts,
  books,
  inventory,
  product,
  reviews,
};

const features = [
  // providesFeature,
  abstractTypesFeature,
];

features.forEach((feature) => {
  defineFeature(feature, (test) => {
    feature.scenarios.forEach((scenario) => {
      test(scenario.title, async ({ given, when, then }) => {
        let query: DocumentNode;
        let variables: any;
        let services: ServiceDefinitionModule[] = [];
        let executionResult: GraphQLExecutionResult & { queryPlan: QueryPlan };

        const executeQuery = async () => {
          if (!executionResult)
            executionResult = await execute(services, { query, variables });
        };

        const givenServices = () => {
          given(/federated (.*) services/i, (servicesString) => {
            const addedServices = servicesString
              .split(',')
              .map((s: string) => s.trim())
              .map(
                (name: string) =>
                  serviceFixtures[name] as ServiceDefinitionModule,
              );
            services = services.concat(addedServices)
          });
        };

        const givenCustomService = () => {
          given(/federated (\w*) service with schema/, (name, typeDefs) => {
            services.push({ name, typeDefs: gql(typeDefs)});
          })
        }

        const whenIExecute = () => {
          when(/^I execute$/im, (operation) => {
            query = gql(operation);
          });
        };

        const andPassVariables = () => {
          when(/^pass variables$/im, (rawVariables) => {
            variables = JSON.parse(rawVariables);
          });
        };

        const thenServiceShouldOrNotBeCalled = () => {
          then(
            /the (.*) service[s]* should (not )*be called/i,
            async (servicesString, not) => {
              const serviceNames = servicesString
                .split(',')
                .map((s: string) => s.trim());

              await executeQuery();
              serviceNames.forEach((name: string) => {
                if (not)
                  expect(executionResult.queryPlan).not.toCallService(name);
                else expect(executionResult.queryPlan).toCallService(name);
              });
            },
          );
        };

        const thenResponseShouldBe = () => {
          then(/the response should be/im, async (expectedResponse) => {
            await executeQuery();
            const { data, errors } = executionResult;
            expect({ data, errors }).toEqual(JSON.parse(expectedResponse));
          });
        };

        const thenQueryPlanShouldBe = () => {
          then(/the query plan should be/im, async (expectedQueryPlan) => {
            await executeQuery();
            const { queryPlan } = executionResult;

            // function serializeQueryPlan(queryPlan: QueryPlan) {
              const serializedPlan = prettyFormat(queryPlan, {
                plugins: [queryPlanSerializer, astSerializer],
              });
            // }
            expect(serializedPlan).toEqual(expectedQueryPlan);
          });
        };

        // step over each defined step in the .feature and execute the correct
        // matching step fn defined above
        scenario.steps.forEach(({ stepText }) => {
          if (/federated (.*)services/i.test(stepText)) givenServices();
          else if (/federated (\w*) service with schema/im.test(stepText)) givenCustomService();
          else if (/^I execute$/im.test(stepText)) whenIExecute();
          else if (/^pass variables$/im.test(stepText)) andPassVariables();
          else if (/the (.*) service[s]* should (not )*be called/i.test(stepText))
            thenServiceShouldOrNotBeCalled();
          else if (/the response should be/im.test(stepText))
            thenResponseShouldBe();
          else if (/the query plan should be/im.test(stepText))
            thenQueryPlanShouldBe();
          else throw new Error('Invalid steps in .feature file');
        });
      });
    });
  });
});
