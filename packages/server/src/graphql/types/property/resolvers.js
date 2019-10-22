//const {post: postModel} = require('../../db/models')
// const db = require("../../../database");
const { knex } = require("../../../database");
module.exports = {

  Query: {
    properties: async (_, __, { dataLoaders, user }) => {
      const properties = await knex('properties').select("*").map(record => {
        return {
          ...record,
          ...record.jsonDoc
        }
      });
      console.log('properties', properties)
      return properties;
      // const users = await db.getUsers();
      // users.forEach(user => {
      //   dataLoaders.user.prime(user.id, user);
      // });
      // return users;
    },
  }
};
