# graphql-apollo-starter-kit

Template for project using Apollo Client and Server, React, Express and Lerna

## Build

```
git clone git@github.com:mxro/graphql-apollo-starter-kit.git
cd graphql-apollo-starter-kit
yarn
```

### Note

May need to install via `yarn --network-timeout 500000` due to material-ui/icons

## Development Environment

To spin up a local development server with hot reload, run:

```
yarn watch
```


## Deploy

To run production version

```
yarn build
PORT=8081 yarn serve
```

## Installing packages

Example (from root directory):

yarn workspace client add @material-ui/core



## Based on

- [Apollo Server Getting Started](https://www.apollographql.com/docs/apollo-server/getting-started.html)
- [create-react-app](https://github.com/facebook/create-react-app)
- [How to get create-react-app to work with a Node.js back-end API](https://medium.freecodecamp.org/how-to-make-create-react-app-work-with-a-node-backend-api-7c5c48acb1b0)





