const { knex } = require("./index");

const addTimestamps = (table, useTimestamps, defaultToNow) => {
  // https://github.com/tgriesser/knex/issues/493#issuecomment-56318688
  const method = useTimestamps === true ? "timestamp" : "datetime";
  const createdAt = table[method]("createdAt");
  const updatedAt = table[method]("updatedAt");
  if (defaultToNow === true) {
    const now = table.client.raw("CURRENT_TIMESTAMP");
    createdAt.notNullable().defaultTo(now);
    updatedAt.notNullable().defaultTo(now);
  }
  return;
};

const upsert = async (knexOrTableName, { where, update, create }) => {
  const knexObj =
    typeof knexOrTableName === "string"
      ? knex(knexOrTableName)
      : knexOrTableName;
  return knexObj.where(where).then(result => {
    if (result.length > 0 && update) {
      return knexObj
        .where(where)
        .update(update, ["*"])
        .then(returnData => {
          return returnData[0];
        });
    } else if (result.length === 0 && create) {
      return knexObj.insert(create, ["*"]).then(returnData => {
        return returnData[0];
      });
    }
  });
};

module.exports = {
  addTimestamps,
  upsert
};
