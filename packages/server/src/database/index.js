const environment = process.env.NODE_ENV || "development";
console.log('environment', environment)
const configMain = require("../../knexfile")[environment];
console.log('configMain', configMain)
const connection = require("knex")(configMain);

module.exports = {
  knex: connection
};
