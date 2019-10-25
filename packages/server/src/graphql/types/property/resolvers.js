//const {post: postModel} = require('../../db/models')
// const db = require("../../../database");
const { knex } = require("../../../database");
const knexQL = require("../../../lib/knexQL")(knex);

module.exports = {

  Query: {
    propertiesConnection: async (_, args, { dataLoaders }) => {
      const options = {};
      const knexObj = knex('properties')
      const splitTerms = (args.where.searchTerm || '').split(' ')
      if (args.where.searchTerm) {
        splitTerms.forEach(splitTerm => {
          knexObj.orWhere('owner1', 'ilike', `%${splitTerm}%`);
          // knexObj.orWhere('owner2', 'ilike', `%${splitTerm}%`);
          // knexObj.orWhere('owner3', 'ilike', `%${splitTerm}%`);
          knexObj.orWhere('location', 'ilike', `%${splitTerm}%`);
          knexObj.orWhere('parcelId', 'ilike', `%${splitTerm}%`);
        })   
        delete args.where.searchTerm;     
       // console.log('args', args)
      }
      //console.log('knexObj', knexObj.toSQL())
      const results = knexQL.connection(knexObj, args, options);
      

     // console.log(knexObj.toSQL())
      return results;
    },
    property: async (_, args, { dataLoaders }) => {
      const property = await knexQL.resolve(knex("properties"), args).first();
      return property;
    }, 
    propertyLandUses: async (_, args, { dataLoaders }) => {
      const propertyLandUses = await knex('properties')
      .select('landUseCode AS code', 'landUseCodeDescription AS description')
      .groupBy('landUseCode', 'landUseCodeDescription')
      .orderByRaw(`CASE WHEN "landUseCode" IN ('0800', '0100','0300') THEN '0' ELSE "landUseCode" END`)

      return propertyLandUses;
    },        
  }
};
