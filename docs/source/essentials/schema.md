---
title: Building a schema
---

## Overview

Every Apollo Server has a GraphQL schema, which describes the data and actions that are accessible by the client. It contains types, which correspond to tangible items or category, such as an `Author` or a `Book`. To define those types, the schema  provides relationships. By defining relationships between entities, a GraphQL schema describes the structure of data without providing the actual data, just like the menu at a cafeteria, which describes the food without the deliciousness.

## Schema Definition Language (SDL)

A GraphQL schema is written in a human-readable Schema Definition Language (or SDL for short) that defines the common language between the client and server. The SDL mirrors JSON and JavaScript's syntax, providing the ability to define membership, such as a `Book` needs a title an `Author` has a name. These memberships can be mutual, since an `Author` writes multiple `Book`s and a `Book` has one primary author. A schema to describe the previously mentioned relationships could look something like this:

```graphql
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

## Queries

A GraphQL query is for reading data.  The schema defines the types of queries which are available to the clients connecting to your server.

> ## Material
>
> * GraphQL query defines the shape of data that will be returned by a particular request
>   * This is what an author + books query looks like coming from the client
>   * make sure it has arguments
> * This query is then checked again the server's schema
>   * looks like this:
> * "root" level queries define the main entry points
> * Each of those root queries returns a type
> * You have to have a query
> * It's an entry point like all rest endpoints
> * It's how you fetch data

## Mutations

Mutations are operations sent to the server to create, update or delete data.  Those familiar with REST-based communication verbs would associate these with the `PUT`, `POST`, `PATCH` and `DELETE` methods.

* Mutations are the main entry point to make updates to the data backing Queries
* Here is what one looks like coming from the client
* Here is the corresponding server schema
* A mutation can contain arguments and fields
* Input types are passed to Apollo Server and inform it how to make the update
* The fields describe the object that is returned by a mutation, often times the object that was created or the entire collection that was modified. Or a confirmation of deletion
  * Here is what the return looks like from the previous mutation call

## Introspection

Introspection is an automatic benefit built into the GraphQL specification which allows users to ask a server what operations it supports.  This facilitates SDL-generation since GraphiQL and other tools will can provide you specific insight into the fields available at each level of a GraphQL operation.  Protecting data exposed by a GraphQL schema is important and more information on security can be found in [security best practices]().


## SCRATCHPAD

* This section ties all of the information in the prereqs to show you how to implement Queries with the Apollo Server
  * essentially copy and paste code that you can then add onto

* Mutations exist because they have special argument types called Input types
* Input types only contain scalar types and cannot have any other input types
  * ensures that data from the client is always serializable and we don't lose any information, since circular references don't survive network call
