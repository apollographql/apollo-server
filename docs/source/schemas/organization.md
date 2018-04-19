---
title: Organization
description: Scaling your Apollo Server from a single file to your entire team
---

## Prerequisites

* Understanding of GraphQL types including queries, and mutations

## Overview

The most simply GraphQL schema may only
> (Evans) think this might not be necessary, or could be put in the best-practices section
> (Jesse) Agree++ with the above ^

* First question? Single file or multiple > start with a single file and then break it up into multiple files by real world category when things get too large
  * we'll cover how to do this in the [schema stitching section]()
* Place your Queries and mutations next to each other, often at the top or bottom of your schema
* Move your Input types near to Mutations
