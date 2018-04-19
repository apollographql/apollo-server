---
title: Introduction
description: What is Apollo Server and what does it do?
---

Apollo Server is the best way to build a production ready GraphQL server. It is designed from day one to make it easy to connect data from your backend(s) to a well designed schema ready for clients to use! Apollo Server is designed to work with every major Node HTTP servers such as Express, Hapi, and Koa, as well as serverless environments like AWS Lambda.

Apollo Server supports the entire GraphQL Spec and can be queried from any GraphQL client. Its':

1.  **Incrementally adoptable**, so you can drop it into an existing app today.
2.  **Universally compatible**, so that Apollo works with any build setup, any GraphQL client, and any data source.
3.  **Simple to get started with**, so you can start loading data right away and learn about advanced features later.
4.  **Production ready**, so you don't have to change what you do to go live.
5.  **Community driven**, because Apollo is driven by the community and serves a variety of use cases.

These docs will help you go from getting started with Apollo to becoming an expert in no time!

## Overview

This documentation aims to provide a complete guide of how to build a GraphQL server by providing easy-to-understand overviews, in-depth guides and comprehensive best-practices.

The documentation is organized with basic concepts and design decisions first and more advanced topics later on.

* Intro as documentation for how to write a GraphQL server
  * what a gql server is
  * covers GraphQL concepts in server context, will not explain concepts in depth or the theory behind them/
    * why is GraphQL more effective on the server
* Each section will have prereqs to get the most out of it
* After finishing you will know
  * what requests a gql server will receive
    * Queries
    * Mutations
    * advanced subscriptions
  * how a gql server defines an api and creates reponses to those requests
  * best practices for designing server
    * auth
    * schema design, etc

## Getting Started

The docs for Apollo Server are mainly written using the [Express integration](), but most of the examples work no matter what server library you use. The docs are broken into six distinct sections to make it easy to find your way around:

1.  **Essentials**, which oultines everything you know in order to get started quickly
2.  **Schema Development**, which goes over just what a GraphQL schema is, and how to write one
3.  **Running a Server**, which explains the mechanics of exposing your schema to clients
4.  **Best Practices**, to explain the best possible way to build a GraphQL service
5.  **Working with Backends**, so you can work with the data you have right away
6.  **API**, to act as an entry point to find API details for key server libraries

Getting started is as simple as installing a few libraries from [npm](./XXX-link-me)! The [setup](./XXX-link-me) is a good place to start your adventure with Apollo Server!

## Productive GraphQL Development

Apollo Server, and the rest of the Apollo ecosystem, give you a powerful set of tools to rapidly stand up a GraphQL API on top of your exsiting, or new, backends. It does this by focusing on a schema-first approach where you build your schema with a concise, declarative syntax, and fill in the logic with data fetching resolver functions. It is easy to get started with [one-step mocking]() while you fill out your data and build your UI. With powerful tools like [schema directives](), [tracing and cache control](), and [schema stitching](), you can build the service of your dreams without writing a line of code more than you need.
