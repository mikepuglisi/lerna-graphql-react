/* eslint no-sync: 0 */
const fs = require("fs");
const glob = require("glob");
const { join } = require("path");
// const { makeExecutableSchema } = require("graphql-tools");
const { graphql } = require("graphql");
const gqlFiles = glob.sync(join(__dirname, "./**/*.?(graphql|gql)"));
const resolverFiles = glob.sync(join(__dirname, "./**/resolvers.js"));
const dataLoaderFiles = glob.sync(join(__dirname, "./**/dataloaders.js"));
const directiveFiles = glob.sync(join(__dirname, "./**/directives/*.js"));

// const gqlFiles = glob.sync(join(__dirname, "./!(_*)/*.?(graphql|gql)"));
// const resolverFiles = glob.sync(join(__dirname, "./!(_*)/resolvers.js"));
// const dataLoaderFiles = glob.sync(join(__dirname, "./!(_*)/dataloaders.js"));
// const customScalars = require("./customScalars/resolvers");

let typeReplacements = ["Query", "Mutation", "Subscription"].map(type => ({
  regExp: new RegExp(`extend type ${type}`),
  replacement: `type ${type}`
}));

const typeDefs = gqlFiles
  .map(file => fs.readFileSync(file, "utf8"))
  .map(file => {
    let newFile = file;

    typeReplacements = typeReplacements.filter(({ regExp, replacement }) => {
      if (regExp.test(newFile)) {
        newFile = newFile.replace(regExp, replacement);
        return false;
      }
      return true;
    });

    return newFile;
  });

const resolvers = resolverFiles.map(file => require(file));
const schemaDirectives = directiveFiles
  .map(file => require(file))
  .reduce((acc, directive) => {
    acc[directive.name] = directive;
    return acc;
  }, {});

const dataLoaders = (...args) =>
  dataLoaderFiles
    .map(file => require(file))
    .reduce(
      (sum, dataLoader) => ({
        ...sum,
        ...dataLoader(...args)
      }),
      {}
    );
// const schema = makeExecutableSchema({
//   typeDefs,
//   resolvers,
//   dataLoaders,
//   schemaDirectives,
//   inheritResolversFromInterfaces: true
// });
module.exports = {
  typeDefs,
  resolvers,
  dataLoaders,
  schemaDirectives,
  // schema,
  query: async (str, params) => {
    return graphql(schema, str, null, { dataLoaders: dataLoaders() }, params);
  }
};
