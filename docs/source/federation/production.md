---
title: Running Federation in production
description: Ensuring reliability and robustness
---

Like any distributed architecture, you should make sure that your federated GraphQL layer has proper observability, monitoring, and automation to ensure reliability and performance of both your gateway and the federated services underneath it. Serving your GraphQL API from a distributed architecture has many benefits, like productivity, isolation, and being able to match the right services with the right runtimes. Operating a distributed system also has more complexity and points of failure than operating a monolith, and with that complexity comes a need to heighten observability into the state of your system and control over its coordination.

There is a wealth of information around reliability in a distributed service-oriented architecture, and those best practices still certainly apply here. For instance, you should ensure that the resource needs of your services are well-understood, that services and the gateway only roll over to a new version after passing health checks, and you should strive to make all services stateful when possible. This document is meant for teams with the need for a federated GraphQL layer, to provide details of nuance in how federation works, how the gateway responds to changes, and best practices in operating federation in production. If you're running with federation in production, we'd love to [hear from you](mailto:federation@apollographql.com) and accept any [contribution](https://github.com/apollographql/apollo-server/blob/master/docs/source/federation/production.md) to this documentation.

## Best Practices

[//]: # (Description: This section should basically introduce that talking with people running gateways in production (and running it ourselves), we've collected some best practices to share)
[//]: # (Assignee: Adam)
[//]: # (Reviewer: Pierre, James)

In operating federation in production ourselves and working with a variety of teams deploying federation in their environments, we have collected some best practices to maintain reliability and control over a federated GraphQL layer at scale. If you're running federation in your infrastructure, we'd love to [hear from you](mailto:federation@apollographql.com) to help share any best practices you and your team may have learned from operating federation at scale.

#### Treat the Gateway as infrastructure

The [Apollo Gateway](https://www.apollographql.com/docs/apollo-server/federation/implementing/#running-a-gateway) understands how to "speak" federation and orchestrate an incoming operation from a client into a set of operations to the underlying services that implement the graph. Because the Gateway understands how to "speak" federation, it should contain **no business logic** and we recommend treating it as you would any infrastructure, such as a load balancer or a service discovery agent. There should be no need to re-deploy the Gateway as services roll out underneath it. The Gateway is designed to be able to smoothly roll over to updates in any services underneath it, and we recommend using the [managed federation](https://www.apollographql.com/docs/apollo-server/federation/production/#managed-federation) to control how changes in underlying services bubble up to the Gateway. That said, like any infrastructure, you'll want to investigate the different [configuration options](https://www.apollographql.com/docs/apollo-server/api/apollo-gateway/) and choose the ones that make sense for your use case. Additionally, make sure to expose your Gateway to sufficient load to understand its resource consumption and provision accordingly.

#### Put graph-level functionality in the Gateway

Because the Gateway is the component of your GraphQL layer that sees and services every client operation, there are a number of things that make sense to happen at the Gateway level. This includes functionality like [reporting metrics](https://www.apollographql.com/docs/apollo-server/features/metrics/), [whole response caching](https://www.apollographql.com/docs/apollo-server/features/caching/#saving-full-responses-to-a-cache), [operation safe-listing](https://www.apollographql.com/docs/platform/operation-registry/), and [automatic persisted queries](https://www.apollographql.com/docs/apollo-server/features/apq/). Because all of this functionality happens at the operation-level, we recommend ensuring that the Gateway is configured to support this functionality rather than exposing it piecemeal in each implementing service. Since the Apollo Gateway is built atop Apollo Server, setting these features up should require nothing more than following the associated guides.

#### Keep implementing services internal

The GraphQL services that implement your graph provide the functionality that the Gateway needs in order to traffic requests. However, because a key principle of the data graph is to strive for [one graph](https://principledgraphql.com/integrity#1-one-graph), there is no need to allow clients to query the underlying services directly without going through the Gateway. Additionally, by exposing implementing services to public traffic, it extends your security and reliablity surface area and makes your system more challenging to secure. While we recommend that the Gateway keep its operation surface area locked down by relying on the [operation registry](https://www.apollographql.com/docs/platform/operation-registry/), it's generally unwieldy to register operations to services, especially when the Gateway may need to make dynamic operations to services using the [`_entities`](https://www.apollographql.com/docs/platform/operation-registry/) field. Further, because of the power and flexibility of the `_entities` field, it may present a serious risk to expose it publicly. If, for some reason, you want to allow outside traffic to send operations to implementing services, we highly recommend keeping the `_entities` field restricted.

#### Use variants to control rollout

With [managed federation](https://www.apollographql.com/docs/apollo-server/federation/production/#managed-federation), you have the ability to control which version of your graph a fleet of Gateways are running with. For the majority of deployments, rolling over all of your Gateways to a new schema version is a good strategy, since changes should be checked to be backwards compatible using [schema validation](https://www.apollographql.com/docs/platform/schema-validation/). However, changes at the Gateway level may involve a variety of different updates, like changing how query plans are generated or transferring type ownership from one service to another. In the case that your infrastructure requires more advanced deployment strategies, we recommend using [graph variants](https://www.apollographql.com/docs/platform/schema-registry/#registering-schemas-to-a-variant) to manage different fleets of Gateways running with different configurations.

For instance, in order to have a canary deployment, you might maintain two production graphs in the [schema registry](https://www.apollographql.com/docs/platform/schema-registry), one called `prod` and one called `prod-canary`. Your deployment of a change to some implementing service named "foo" might look something like this:

1. Check changes in "foo" against `prod` and `prod-canary`: `apollo service:check --tag=prod --serviceName=foo && apollo service:check --tag=prod-canary --serviceName=foo`
1. Deploy changes to "foo" into your production environment (_Note: This will not roll out changes to the Gateway yet_)
1. Roll over the `prod-canary` graph, containing one Gateway container, using `apollo service:push --tag=prod-canary --serviceName=foo` (_Note: If composition fails due to intermediate changes to the canary graph, new configuration will not be rolled out_)
1. Wait for health checks to pass against the canary, watch dashboards, etc.
1. After the canary is stable, roll out the changes to the rest of production using `apollo service:push --tag=prod --serviceName=foo`

Because you can [tag metrics with variants](https://www.apollographql.com/docs/platform/schema-registry/#associating-metrics-with-a-variant) as well, you can use the [Engine UI](https://engine.apollographql.com) to verify a canary's performance before rolling out changes to the rest of the graph. You can also use a similar strategy with variants to support a variety of other advanced deployment workflows, like blue/green deployments.

## Managed Federation
[//]: # (Description: This section should discuss the basic idea of managed federation without getting into specific and talk vaguely of the problem of service rollout and looking for a balance of automation and observability, workflow, etc.)
[//]: # (Assignee: Jackson)
[//]: # (Reviewer: Adam)

In small scale cases it can be sufficient to define the list of services comprising a federated graph directly within the gateway, and manually update the list and restart the server as services are modified and created. However for larger scale projects it is helpful to be able to remotely manage the gateway, such that new services may be added, or existing services modified, all with zero downtime.

For these use cases, `Apollo Gateway` can be configured to pull a remotely hosted service list from the [Schema Registry](https://www.apollographql.com/docs/platform/schema-registry/) on `Apollo Dashboard`. This is `Managed Federation`, and it is a key component of building a robust federated graph that can be concurrently developed by teams of any size.

#### Overview

// TODO: Document the overview of managing federation workflow, happy path

#### Controlling rollout

To begin, ensure all component services are up and running, and the working directory has a `.env` file containing the appropriate `ENGINE_API_KEY` for your federated service. Then, upload each service to the gateway through `Apollo CLI`:

```bash
apollo service:push       \
  --serviceURL={{url}}    \
  --endpoint={{url}}      \
  --serviceName={{name}}  \
  --federated
```

> Each service needs a unique name, this is how you will identify the service for schema updates

The given `endpoint` will be queried for the new schema which, if compatible with the rest of the schema, will be uploaded to `Apollo Engine`. At this point, any gateways serving this graph will begin to roll over to the new schema.

You can later modify hosted service definitions by rerunning the `apollo service:push` command with the service's name and the new URL.

> What's the difference between `serviceURL` and `endpoint` parameters? The `endpoint` parameter controls the endpoint where the schema will be fetched from at composition, whereas `serviceURL` controls what URL the gateway will query at runtime. This is especially helpful if you have disabled introspection queries in your production services.

// TODO: Document the integration with service:push, services under a graph, and gateway lifecycle management utilities

#### Reliability

[//]: # (Description: This section should document how the Gateway polls GCS for updates, why it's a reliable model, what the defaults are, and any recommendations)
[//]: # (Assignee: Jackson)
[//]: # (Reviewer: Adam)

When operating as a managed gateway, `Apollo Server` will poll the [Schema Registry](https://www.apollographql.com/docs/platform/schema-registry/) for updates to the registered service list at 10 second intervals. When a service list update does occur, `Apollo Server` will create a new composed schema from the federated services, and begin to roll over to serving the new schema. Existing in-flight operations on the old schema will continue to be processed while serving the new schema. For this reason, it can be helpful to serve the new schemas from new endpoints, such that no downtime is incurred during rollover.

In the event a network failure prevents an `Apollo Server` gateway from contacting the schema registry, the gateway will continue to serve the last known schema while it attempts to reestablish a connection to the schema registry.

// TODO: Document the model of operating on top of GCS, ways of falling back to local files & introspection
<!--
  Jackson: There is no way of falling back to local files/introspection currently, but I also don't think there should be, consider:
  The usage model of managed gateways is:
  1. Launch services
  2. Post their schema's to registry
  3. Update services with new schemas and URLs
  4. GOTO 2
  If a network failure occurs after several updates and the gateway falls back to a locally stored list, that list will almost certainly be outdated. On the other hand, if it falls back to the last known good configuration, it has a much higher chance of still being active.
-->


## Monitoring your infrastructure

// TODO: General talk about monitoring distributed systems & monitoring GraphQL

#### Observing Gateway Changes

[//]: # (Description: An explanation of observability options for the gateway with some helpful examples and / or anecdotes)
[//]: # (Assignee: Trevor)
[//]: # (Reviewer: Jake)

// TODO: Instructions on how to observe the gateway rolling over to a new version & when to alert

#### Enabling Federated Metrics

[//]: # (Description: A brief, no-frills this is how you do it. Link back to the federated metrics doc)
[//]: # (Assignee: Adam)
[//]: # (Reviewer: Jesse)

// TODO: Instructions on how federated metrics should be instrumented, without explaining the whole model

#### Monitoring federated services

// TODO: Instructions on monitoring the gateway talking to implementing services. Note that users should monitor their internal services just like anything else.

#### Inspecting Query Plans

When the gateway receives a new query, it generates a query plan that defines the sequence of requests the gateway will send to the necessary downstream services. Inspecting a query plan can be a helpful tool in understanding the gateway and exploring how directives like [`@requires`](/federation/advanced-features/#computed-fields) and [`@provides`](/federation/advanced-features/#using-denormalized-data) can help optimize query plans. To make it easy to access query plans, the `@apollo/gateway` package includes a build of GraphQL Playground that adds a query plan inspector.


![playground](../images/playground.png)

#### Observing Gateway Composition

[//]: # (Description: An explanation of this observability option for the gateway with some helpful examples and / or anecdotes)
[//]: # (Assignee: Trevor)
[//]: # (Reviewer: Jake)

// TODO: Comment about how composition can fail and instructions on monitoring for it

#### Observing Query plans

[//]: # (Description: An explanation of this observability option for the gateway with some helpful examples and / or anecdotes)
[//]: # (Assignee: Trevor)
[//]: # (Reviewer: Jake)

// TODO: Instructions about how users can observe operations being executed against query plans directly or how query plans can actually fail to be generated even if composition succeeds
