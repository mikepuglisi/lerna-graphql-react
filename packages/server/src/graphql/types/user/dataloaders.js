const DataLoader = require("dataloader");
// const {post} = require('../db/models')
const { knex } = require("../../../database");

module.exports = () => ({
  user: new DataLoader(
    async ids =>
      await Promise.all(
        ids.map(
          async id =>
            await knex("users")
              .where("id", id)
              .first()
        )
      )
  )
});
