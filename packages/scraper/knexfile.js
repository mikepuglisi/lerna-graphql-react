// require("dotenv").config();
module.exports = {

  development: {
    client: "pg",
    connection: {
      host: 'localhost',
      port: '54320',
      user: 'admin',
      password: 'admin',
      database: 'properties',
    },
    useNullAsDefault: true,
    debug: false,
    migrations: {
      tableName: "_knex_migrations",
      directory: "./database/migrations"
    },
    seeds: {
      directory: "./database/seeds"
    }
  },  
  // development: {
  //   client: "sqlite3",
  //   connection: {
  //     filename: "./database/mydb.sqlite"
  //   },
  //   useNullAsDefault: true,
  //   debug: false,
  //   migrations: {
  //     tableName: "_knex_migrations",
  //     directory: "./database/migrations"
  //   }
  // },


  // test: {
  //   client: "mssql",
  //   connection: {
  //     host: process.env.BHIP_DB_HOST,
  //     user: process.env.BHIP_DB_USERNAME,
  //     password: process.env.BHIP_DB_PASSWORD,
  //     database: process.env.BHIP_DB_DATABASE
  //   },
  //   useNullAsDefault: true,
  //   debug: true,
  //   migrations: {
  //     tableName: "_knex_migrations",
  //     directory: "./database/migrations"
  //   },
  //   seeds: {
  //     directory: "./database/seeds"
  //   }
  // },

  // production: {
  //   client: "mssql",
  //   connection: {
  //     host: process.env.BHIP_DB_HOST,
  //     user: process.env.BHIP_DB_USERNAME,
  //     password: process.env.BHIP_DB_PASSWORD,
  //     database: process.env.BHIP_DB_DATABASE
  //   },
  //   useNullAsDefault: true,
  //   debug: false,
  //   migrations: {
  //     tableName: "_knex_migrations",
  //     directory: "./database/migrations"
  //   }
    // seeds: {
    //   directory: "./database/seeds"
    // }
 // }
};
