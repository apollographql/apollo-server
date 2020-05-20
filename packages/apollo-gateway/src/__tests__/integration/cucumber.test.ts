import gql from 'graphql-tag';
import {
  execute,
  ServiceDefinitionModule,
} from '../execution-utils';

import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

import { defineFeature, loadFeature } from 'jest-cucumber';
import { DocumentNode } from 'graphql';
import { GraphQLExecutionResult } from 'apollo-server-types';
import { QueryPlan } from '../..';
const feature = loadFeature(
  './packages/apollo-gateway/src/__tests__/integration/provides.feature',
);

let serviceFixtures: { [key: string]: ServiceDefinitionModule } = {
  accounts,
  books,
  inventory,
  product,
  reviews,
};

defineFeature(feature, (test) => {
  feature.scenarios.forEach((scenario) => {
    test(scenario.title, async ({ given, when, then }) => {
      let query: DocumentNode;
      let services: ServiceDefinitionModule[];
      let executionResult: GraphQLExecutionResult & { queryPlan: QueryPlan };

      const executeQuery = async () => {
        if (!executionResult)
          executionResult = await execute(services, { query });
      };

      const givenServices = () => {
        given(/federated (.*) services/i, (servicesString) => {
          services = servicesString
            .split(',')
            .map((s: string) => s.trim())
            .map(
              (name: string) =>
                serviceFixtures[name] as ServiceDefinitionModule,
            );
        });
      };

      const whenIExecute = () => {
        when(/^I execute$/im, (operation) => {
          query = gql(operation);
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
        then(/the response should be/i, async (expectedResponse) => {
          await executeQuery();
          const { data, errors } = executionResult;
          expect({ data, errors }).toEqual(JSON.parse(expectedResponse));
        });
      };

      // step over each defined step in the .feature and execute the correct
      // matching step fn defined above
      scenario.steps.forEach(({ stepText }) => {
        if (/federated (.*)services/i.test(stepText)) givenServices();
        else if (/^I execute$/im.test(stepText)) whenIExecute();
        else if (/the (.*) service[s]* should (not )*be called/i.test(stepText))
          thenServiceShouldOrNotBeCalled();
        else if (/the response should be/i) thenResponseShouldBe();
        else throw new Error('Invalid steps in .feature file');
      });
    });
  });
});
