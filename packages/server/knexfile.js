
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
      directory: "./src/database/migrations"
    }
  }
};
