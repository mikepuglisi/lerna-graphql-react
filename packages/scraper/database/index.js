const environment = process.env.NODE_ENV || "development";
const configMain = require("../knexfile")[environment];
const connection = require("knex")(configMain);

module.exports = {
  knex: connection
};

// module.exports.knex = knex;