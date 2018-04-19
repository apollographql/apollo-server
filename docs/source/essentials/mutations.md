---
title: Mutations
description: Updating data the Apollo way
---

## Prerequisites

* A basic understanding of a GraphQL schema ([Schema]())

## Overview

Mutations are operations sent to the server to create, update or delete data.  Those familiar with REST-based communication verbs would associate these with the `PUT`, `POST`, `PATCH` and `DELETE` methods.

* Mutations are the main entry point to make updates to the data backing Queries
* Here is what one looks like coming from the client
* Here is the corresponding server schema
* A mutation can contain arguments and fields
* Input types are passed to Apollo Server and inform it how to make the updata
* The fields describe the object that is retuned by a mutation, often times the object that was created or the entire collection that was modified. Or a confirmation of deletion
  * Here is what the return looks like from the previous mutation call

**Actually writing resolvers for your mutations is found in server/mutations**

## Why mutations exist?

* Mutations exist because they have special argument types called Input types
* Input types only contain scalar types and cannot have any other input types
  * ensures that data from the client is always serializable and we don't lose any information, since circular references don't survive network call