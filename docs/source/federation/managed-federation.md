---
title: Running Federation in production
description: Ensuring reliability and robustness
---

Like any distributed architecture, you should make sure that your federated GraphQL layer has proper observability and monitoring to ensure the best reliability and performance of both your gateway and the federated services underneath it. This document is meant to provide best practices and how-tos for observability and control over your federated architecture. If you're running Federation in production, we'd love to [hear from you](<LINK_TO_EMAIL>) and accept any [contribution](LINK_TO_GITHUB) to this documentation.

## Managed Federation

// TODO: Document the outline for how managed federation works, how to enable it, how it protects, etc.

#### Overview

// TODO: Document the overview of managing federation

#### Controlling rollout

// TODO: Document the integration with service:push, services under a graph, and gateway lifecycle management utilities

#### Reliability

// TODO: Document the model of operating on top of GCS, ways of falling back to local files & introspection

## Best Practices

// TODO: Another call to action and introduction of section

#### Keeping implementing services internal

// TODO: Security -- discuss the recommendation that all implementing services should not expose their partial schema

#### Using variants to control rollout

// TODO: Document how to use a variant in order to have a canary gateway

## Monitoring your infrastructure

// TODO: General talk about monitoring distributed systems & monitoring GraphQL

#### Observing Gateway Changes

// TODO: Instructions on how to observe the gateway rolling over to a new version & when to alert

#### Enabling Federated Metrics

// TODO: Instructions on how federated metrics should be instrumented, without explaining the whole model

#### Monitoring federated services

// TODO: Instructions on monitoring the gateway talking to implementing services. Note that users should monitor their internal services just like anything else.

#### Inspecting Query Plans

When the gateway receives a new query, it generates a query plan that defines the sequence of requests the gateway will send to the necessary downstream services. Inspecting a query plan can be a helpful tool in understanding the gateway and exploring how directives like [`@requires`](/federation/advanced-features/#computed-fields) and [`@provides`](/federation/advanced-features/#using-denormalized-data) can help optimize query plans. To make it easy to access query plans, the `@apollo/gateway` package includes a build of GraphQL Playground that adds a query plan inspector.


![playground](../images/playground.png)

#### Observing Gateway Composition

// TODO: Comment about how composition can fail and instructions on monitoring for it

#### Observing Query plans

// TODO: Instructions about how users can observe operations being executed against query plans directly or how query plans can actually fail to be generated even if composition succeeds
