---
title: Running Federation in production
description: Ensuring reliability and robustness
---

Like any distributed architecture, you should make sure that your federated GraphQL layer has proper observability and monitoring to ensure the best reliability and performance of both your gateway and the federated services underneath it. This document is meant to provide best practices and how-tos for observability and control over your federated architecture. If you're running Federation in production, we'd love to [hear from you](<LINK_TO_EMAIL>) and accept any [contribution](LINK_TO_GITHUB) to this documentation.

## Managed Federation
[//]: # (Description: This section should discuss the basic idea of managed federation without getting into specific and talk vaguely of the problem of service rollout and looking for a balance of automation and observability, workflow, etc.)
[//]: # (Assignee: Adam)
[//]: # (Reviewer: James)

#### Overview

// TODO: Document the overview of managing federation workflow, happy path

#### Controlling rollout

// TODO: Document the integration with service:push, services under a graph, and gateway lifecycle management utilities

#### Reliability

[//]: # (Description: This section should document how the Gateway polls GCS for updates, why it's a reliable model, what the defaults are, and any recommendations)
[//]: # (Assignee: Jackson)
[//]: # (Reviewer: Adam)

// TODO: Document the model of operating on top of GCS, ways of falling back to local files & introspection

## Best Practices

[//]: # (Description: This section should basically introduce that talking with people running gateways in production (and running it ourselves), we've collected some best practices to share)
[//]: # (Assignee: Adam)
[//]: # (Reviewer: Pierre, James)

// TODO: Another call to action and introduction of section

#### Keeping implementing services internal

// TODO: Security -- discuss the recommendation that all implementing services should not expose their partial schema

#### Using variants to control rollout

// TODO: Document how to use a variant in order to have a canary gateway

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
