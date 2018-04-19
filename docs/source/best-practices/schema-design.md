---
title: Schema Design
description: The best way to fetch data, update it, and keep things running for a long time
---

GraphQL schemas are at their best when they are designed around the need of the users interaction points, instead of the shape of how the data is stored. Often times teams will create schemas that are literal mappings on top of their collections or tables with CRUD like root fields. While this may be a fast way to get up and running, a strong long term GraphQL schema is built around the products usage.

## Naming

One of the classic problems in computer science, how to name types and fields is a common question for teams getting started with GraphQL. While there is a ton of flexibility, by design, with the specification, here are a few recommendations that have proven themselves in production applications:

- field names should be camelCase since the majority of consumers will be in client applications written in JavaScript
- type names should be PascalCase
- enums should be PascalCase and their values should be `ALL_CAPS` to denote a special value


Into note about schemas being for products, not for databases

## Node interface

## Mutation Response

## Pagination

## Field naming / CRUD
