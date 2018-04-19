---
title: Building a schema
description: The why, what, and how of building a schema
---

## Prerequisites

* `TODO` Types? (Query = type, so might be better)

## Overview

Every Apollo Server has a GraphQL schema, which describes the data and actions that are accessible by the client. It contains types, which correspond to tangible items or category, such as an `Author` or a `Book`. To define those types, the schema  provides relationships. By defining relationships between entities, a GraphQL schema describes the structure of data without providing the actual data, just like the menu at a cafeteria, which describes the food without the deliciousness.

## Schema Definition Language (SDL)

A GraphQL schema is written in a human-readable Schema Definition Language (or SDL for short) that defines the common language between the client and server. The SDL mirrors JSON and JavaScript's syntax, providing the ability to define membership, such as a `Book` needs a title an `Author` has a name. These memberships can be mutual, since an `Author` writes multiple `Book`s and a `Book` has one primary author. A schema to describe the previously mentioned relationships could look something like this:

```
type Book {
  title: String
  author: Author
}

type Author {
  books: [Book]
}
```

Take not that the schema is based upon the real world relationships between objects rather than the underlying data store. This real world basis provides the most intuitive interaction for the front-end. In addition, it ensures that the server understands what data will be retrieved together and can stay performant.

Whether designing a new application or creating a GraphQL layer over your existing back-end, this basis in logical connections is the most important consideration is to define your schema. It is tempting to define a schema based on the current layout of your database, micro-services, or REST endpoints. Your GraphQL schema is going to be used across your entire organization and should facilitate the organization of your back-end services as well as enable front-end developers to easily discover what data can and should be retrieved together.

> Often times mature architectures have been battle tested and optimized for certain views. There is a temptation to translate this data directly into the SDL. This can be an effective migration path provided there is a way to add new GraphQL schema types for new use cases. Often times, since these are newer features with less critical performance guarantees, it is acceptable to retrieve a portion of fields for  a given field from the optimized backing

## Execution Instructions (resolvers)

In addition to the SDL describing the interface and types, a complete schema includes functions that provide the implementation of how the SDL is executed on the server.
