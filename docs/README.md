# Documentation

This is the documentation **source** for this repository.

The **deployed** version of the documentation for this repository is available at:

* https://www.apollographql.com/docs/apollo-server/

## Running locally

For more information, consult the documentation for the documentation, referenced above.

In general though:

* `npm install` in this directory
* `npm start` in this directory
* Open a browser to the link provided in the console.

> **Important note:** Changes to the markdown source does not result in an automatic "hot reload" in the browser; it is necessary to reload the page manually in the browser to see it re-rendered. Additionally, changes to `_config.yml` require stopping the server and restarting with `npm start` again.

## Deploy previews

Documentation repositories should be setup with a "deploy preview" feature which automatically provides "preview" links in the _status checks_ section of pull-requests.

In the event that it's not possible to run the documentation locally, pushing changes to the branch for a pull-request can be a suitable alternative that ensures changes to the documentation are properly rendered.
