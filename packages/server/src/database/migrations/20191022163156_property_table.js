exports.up = async function(knex, Promise) {
  await knex.schema.createTable("properties", table => {
    table.increments("id").primary();
    table.string("legacyId");
    table.string("parcelId");
    table.jsonb("jsonDoc");
    table.timestamps();
  });
  return knex('properties').insert({legacyId: '123', parcelId: '123', jsonDoc: JSON.stringify({'address': '123 Anystree Way'})});
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("properties");
};
