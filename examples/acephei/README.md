# Acephi Corp

Fictional company Acephei for demonstrating Apollo features and workflow

## Requirements

* Node >= 12 (recommend using `nvm`)
* Visual Studio Code

## Code repo setup

* Clone the [apollo-server repo](https://github.com/apollographql/apollo-server)

```bash
git clone https://github.com/apollographql/apollo-server
```

* `npm install` in main directory and in the acephei example folder

```bash
cd apollo-server
npm install
cd examples/acephei
npm install
```

* *(Optional)*: Setup [Apollo Studio](https://studio.apollographql.com/) account and create your first graph. You'll need to copy the service API key for later on.

### Quick start script

There is a `start.js` script that will run all of the gateway and services locally. We combine this in the projects `start` script with nodemon that you can run:

```bash
npm start
```

To run without nodemon:

```bash
node start.js
```

### Debugging with VS Code

There is a `gateway.code-workspace` file that can be [opened in VS Code](https://code.visualstudio.com/docs/editor/multi-root-workspaces) which will have debugging capabilities for all projects. Open this file in VS Code.

The launch configurations are defined in the `.vscode/launch.json` folders within each service project. There are 6 debugging options available:

* Launch All - This launches the gateway and all downstream services in debug mode
* Launch Accounts - Debugs only the accounts service
* Launch Books - Debugs only the books service
* Launch Gateway - Debugs only the gateway
* Launch Products - Debugs only the products service
* Launch Reviews - Debugs only the reviews service

*Note*: You may want to set the environment variables for the graph you created in your Apollo Account. Open the `services/gateway/.vscode/launch.json` and you can set the keys before starting the debugger.

## Apollo Studio - Setting up your graph

If you would like to setup this example with the graph you created in your [Apollo Studio](https://studio.apollographql.com/) account, you'll need to register each downstream service using the [Apollo CLI](https://github.com/apollographql/apollo-tooling):

```
apollo service:push --key={service:michael-watson:key_1234} --localSchemaFile=./services/accounts/schema.graphql --serviceName=accounts --serviceURL=http://localhost:4001

apollo service:push --key={service:michael-watson:key_1234} --localSchemaFile=./services/books/schema.graphql --serviceName=books --serviceURL=http://localhost:4005

apollo service:push --key={service:michael-watson:key_1234} --localSchemaFile=./services/products/schema.graphql --serviceName=products --serviceURL=http://localhost:4003

apollo service:push --key={service:michael-watson:key_1234} --localSchemaFile=./services/reviews/schema.graphql --serviceName=reviews --serviceURL=http://localhost:4002
```

After this, you should be able to start the project with your API key:

```
APOLLO_KEY={service:michael-watson:key_1234} npm start
```
