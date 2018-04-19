---
title: Queries
description: Turning queries into data
---

## Prerequisites

* A basic understanding of a GraphQL schema ([Schema]())

## Overview

A GraphQL query is for reading data.  The schema defines the types of queries which are available to the clients connecting to your server.

## Material

* GraphQL query defines the shape of data that will be returned by a particular request
  * This is what an author + books query looks like coming from the client
  * make sure it has arguments
* This query is then checked again the server's schema
  * looks like this:
* "root" level queries define the main entry points
* Each of those root queries returns a type

**Actually writing resolvers for your queries is found in server/queries**

> TODO: The below headings were left over from the other document.  Do we want to remove them?

## Fetching data

## Shaping results

## Linking data sources
