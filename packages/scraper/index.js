const puppeteer = require('puppeteer');
const { knex } = require('./database');
const fs = require('fs');
const fsp = fs.promises;
const moment = require('moment')
const csv=require('csvtojson')

// const upsert = async (knexOrTableName, { where, update, create }) => {
//   const knexObj =
//     typeof knexOrTableName === "string"
//       ? knex(knexOrTableName)
//       : knexOrTableName;

//   return knexObj.where(where).then(result => {
//     if (result.length > 0 && update) {
//       return knexObj
//         .where(where)
//         .update(update, ["*"])
//         .then(returnData => {
//           return returnData[0];
//         });
//     } else if (result.length === 0 && create) {
//       return knexObj.insert(create, ["*"]).then(returnData => {
//         return returnData[0];
//       });
//     }
//   });
// };

const getDate = (val) => {
  try {
    // console.log('val', `${val}`)
    if (`${val}`.trim() === "") {      
      return '1900-01-01'
    }
    return moment(val).format('YYYY-MM-DD')
  } catch (e) {
    return '1900-01-01'
  }
}

const getPrice = (val) => {

    // console.log('val', `${val}`)
    if (`${val}`.trim() === "" || `${val}`.trim() === "TBD") {      
      return '0'
    }
    return val

}

const formatValue = (key, val) => {
  if (key === 'SaleDate') {
     return getDate(val)
  } else if (key === 'SalePrice') {
    return getPrice(val)
  }
  return val
}

const normalizeKeysForDatabase = (obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    // const value = key === 'SaleDate' ? getDate(obj[key]) : obj[key]
    const value = formatValue(key, obj[key])
    acc[key.charAt(0).toLowerCase() + key.replace(/ID/, "Id").slice(1)] = value;
    return acc;
  }, {});
}

const upsert = (table, object, constraint)=> {
  
  const insert = knex(table).insert(object);
  const update = knex.queryBuilder().update(object);
  const q = knex.raw(`? ON CONFLICT ("${constraint}") DO ? returning *`, [insert, update]).get('rows').get(0);
  // console.log('q', q)
 //  console.log('update', update.toSQL())
  return knex.raw(`? ON CONFLICT ("${constraint}") DO ? returning *`, [insert, update]).get('rows').get(0);
};

// const upsert = async (knexOrTableName, { where, update, create }) => {
//   const knexObj =
//     typeof knexOrTableName === "string"
//       ? knex(knexOrTableName)
//       : knexOrTableName;
//   const insertStatement = knexObj
//       .insert(create)
//       .toString();
//   const updateStatement = knexObj
//       .update(update)
//       .toString();

//       console.log('insertStatement', insertStatement)

//       return insertStatement;

//   // const keepValues = columnsToRetain.map((c) => `"${c}"=${tableName}."${c}"`).join(',');
//   // const conflictColumns = conflictOn.map((c) => `"${c.toString()}"`).join(',');
//   // let insertOrUpdateQuery = `${insert} ON CONFLICT( ${conflictColumns}) DO ${update}`;
//   // insertOrUpdateQuery = keepValues ? `${insertOrUpdateQuery}, ${keepValues}` : insertOrUpdateQuery;
//   // insertOrUpdateQuery = insertOrUpdateQuery.replace(`update "${tableName}"`, 'update');
//   // insertOrUpdateQuery = insertOrUpdateQuery.replace(`"${tableName}"`, tableName);
//   // return Promise.resolve(knex.raw(insertOrUpdateQuery));
// };

// const upsert = (t, tableName, columnsToRetain, conflictOn) => {
//   const insert = knex(tableName)
//       .insert(t)
//       .toString();
//   const update = knex(tableName)
//       .update(t)
//       .toString();
//   const keepValues = columnsToRetain.map((c) => `"${c}"=${tableName}."${c}"`).join(',');
//   const conflictColumns = conflictOn.map((c) => `"${c.toString()}"`).join(',');
//   let insertOrUpdateQuery = `${insert} ON CONFLICT( ${conflictColumns}) DO ${update}`;
//   insertOrUpdateQuery = keepValues ? `${insertOrUpdateQuery}, ${keepValues}` : insertOrUpdateQuery;
//   insertOrUpdateQuery = insertOrUpdateQuery.replace(`update "${tableName}"`, 'update');
//   insertOrUpdateQuery = insertOrUpdateQuery.replace(`"${tableName}"`, tableName);
//   return Promise.resolve(knex.raw(insertOrUpdateQuery));
// };

//INSERT INTO table_name(column_list) VALUES(value_list)
// ON CONFLICT target action;
async function main() {
  const csvFilePath='./database/data/RealPropertyGeneralMailingInformation.csv'
// Async / await usage
  csv()
  .fromFile(csvFilePath)
  .subscribe(async (csvLine)=>{ 
    // csvLine =>  "1,2,3" and "4,5,6"
    try {
      const recordToUpsert = normalizeKeysForDatabase(csvLine);
      recordToUpsert.legacyId = recordToUpsert.propertyId;
      console.log('recordToUpsert.legacyId', recordToUpsert.legacyId)
      delete recordToUpsert.propertyId;

      // const recordToUpsert = {
      //   parcelId: csvLine.ParcelID,
      //   legacyId: csvLine.PropertyID,
      //   jsonDoc: csvLine }


        //    table.increments("id").primary();
    // table.string("legacyId");
    // table.string("parcelId");
    // table.jsonb("jsonDoc");
      // console.log(csvLine)
      // recordToUpsert.legacyId = recordToUpsert.propertyId;
      // delete recordToUpsert.propertyId;
     // console.log('recordToUpsert', recordToUpsert)

     const inserted =  await upsert('properties', recordToUpsert, 'parcelId'); // { where: { ParcelID: recordToUpsert.ParcelID }, update: recordToUpsert, create: recordToUpsert} )
      console.log('inserted', inserted.id)
    } catch (e) {
      console.log('er', e)
    }

  })

  // const browser = await puppeteer.launch({headless: false, userDataDir: "./user_data"});
  // const page = await browser.newPage();
  // await page.setViewport({width: 1200, height: 720});
  // page.on('response', response => {
  //   // allow XHR only
  //   console.log('response', response)
  //   if ('xhr' !== response.request().resourceType()){
  //       return;
  //   }
  // });

  // await page.goto(`https://www.google.com`, { waitUntil: 'networkidle0' }); // wait until page load , { waitUntil: 'networkidle0' }
  
  
  
  // const loginRequired = await page.$('#loginname')
  // if (loginRequired) {
  //   await page.type('#loginname', "");
  //   await page.click('[type=submit]');
  //   try {
  //     await page.waitForSelector('#password');
  //     await page.type('#password', "");
  //   } catch (e) {
  //     if (e instanceof puppeteer.errors.TimeoutError) {
  //       // Do something if this is a timeout.
  //     }
  //   }
  //   // await page.click('[type=submit]');
  //   //await page.click('#rememberMe');
  //   // await page.click('#form-submit');
  //   await Promise.all([
  //     page.click('[type=submit]'),
  //     page.waitForNavigation({ waitUntil: 'networkidle0' }),
  //   ]);
  // }
  // const rateLink = await page.$('[data-toggle-rate-category]')
  // if (rateLink) {
  //   await Promise.all([
  //     page.click('[data-toggle-rate-category]'),
  //     page.waitForSelector('[href="#daterange-changes"]')
  //   ])
  // } else {
  //   console.log("RATE LINK NOT FOUND")
  // }

};

main();