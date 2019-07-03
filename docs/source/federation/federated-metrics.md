---
title: Federated Traces
description: How federated tracing works
---

[//]: # (Description: An overall update to everything federated metrics, including how it works and how to turn it on)
[//]: # (Assignee: Adam Z)
[//]: # (Reviewer: James)

One of the many benefits of using GraphQL as an API layer is that it enables fine-grained tracing of every API call. One of the features of the Apollo platform is support for consuming and aggregating those traces in order to provide detailed insights into your GraphQL layer's performance and usage. In order to support this same functionality, the Federation model includes support for sending a [federated trace](<LINK_TO_PROTOBUF_OR_SPEC>) from the Gateway, which is constructed from timing and error information that underlying services expose. These federated traces capture the service-level detail in the shape of the query plan, which is sent to Apollo's [metrics ingress](LINK_TO_DOCS) by default, and aggregated into query-level stats and field-level stats. The overall flow of a trace is as follows:

1. // TODO: Document how a trace is constructed and sent

## Exposing tracing data from a federated service

// TODO: Document how to expose a trace from a federated service

## How the Gateway constructs traces

// TODO: Document how the gateway works, point to code

## How errors work

// TODO: Document how formatError, rewriteError fit in
