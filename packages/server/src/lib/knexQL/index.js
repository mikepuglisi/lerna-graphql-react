/*
  # String filters
  text: String # matches all nodes with exact value
  text_between: [Any, Any] # Uses first two values of array for a BETWEEN SQL statement.
  text_not: String # matches all nodes with different value
  text_in: [String!] # matches all nodes with value in the passed list
  text_not_in: [String!] # matches all nodes with value not in the passed list
  text_lt: String # matches all nodes with lesser value
  text_lte: String # matches all nodes with lesser or equal value
  text_gt: String # matches all nodes with greater value
  text_gte: String # matches all nodes with greater or equal value
  text_contains: String # matches all nodes with a value that contains given substring
  text_not_contains: String # matches all nodes with a value that does not contain given substring
  text_starts_with: String # matches all nodes with a value that starts with given substring
  text_not_starts_with: String # matches all nodes with a value that does not start with given substring
  text_ends_with: String # matches all nodes with a value that ends with given substring
  text_not_ends_with: String # matches all nodes with a value that does not end with given substring
}
*/
const pluralize = require("pluralize");
const GROUPS = {
  OR: "or",
  AND: "and"
};
const FILTERS = {
  not: {
    method: "whereNot",
    args: (column, value) => [column, value]
  },
  gt: {
    method: "where",
    args: (column, value) => [column, ">", value]
  },
  gte: {
    method: "where",
    args: (column, value) => [column, ">=", value]
  },
  lt: {
    method: "where",
    args: (column, value) => [column, "<", value]
  },
  lte: {
    method: "where",
    args: (column, value) => [column, "<=", value]
  },
  eq: {
    method: "where",
    args: (column, value) => [column, "=", value]
  },
  in: {
    method: "whereIn",
    args: (column, value) => [column, value]
  },
  not_in: {
    method: "whereNotIn",
    args: (column, value) => {
      return [column, value];
    }
  },
  between: {
    method: "whereBetween",
    args: (column, value) => {      
      return [column, value];
    }
  },  
  contains: {
    method: "where",
    args: (column, value) => [column, "like", `%${value}%`]
  },
  not_contains: {
    method: "whereNot",
    args: (column, value) => [column, "like", `%${value}%`]
  },
  starts_with: {
    method: "where",
    args: (column, value) => [column, "like", `${value}%`]
  },
  not_starts_with: {
    method: "whereNot",
    args: (column, value) => [column, "like", `${value}%`]
  },
  ends_with: {
    method: "where",
    args: (column, value) => [column, "like", `%${value}`]
  },
  not_ends_with: {
    method: "whereNot",
    args: (column, value) => [column, "like", `%${value}`]
  }
};

const getEntries = objOrArray => {
  return Array.isArray(objOrArray)
    ? objOrArray.map(obj => [Object.keys(obj)[0], Object.values(obj)[0]])
    : Object.entries(objOrArray);
};

const upperCaseFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);

const transformWhereClauses = (knexObj, whereClauses, grouping) => {
  const knexBuilder = knexObj;
  //console.log("grouping", grouping);
  const entries = getEntries(whereClauses);
  // console.log("whereClauses", whereClauses);
  entries.forEach(([key, value]) => {
    if (!GROUPS[key]) {
      const operator = key.match(/_(.*)/, "");
      //  console.log("operator", operator);
      if (operator) {
        const column = key.replace(/_.*/, "");
        //console.log({ [column]: value });
        const filterKey = operator[1];
        //console.log(FILTERS[filterKey]);
        const filterData = FILTERS[filterKey];
        // console.log(filterData.args(column, value));
        const methodName = grouping
          ? `${grouping}${upperCaseFirstLetter(filterData.method)}`
          : filterData.method;
        //console.log("methodName", methodName);
        knexBuilder[methodName](...filterData.args(column, value));
      } else {
        knexBuilder.where({ [key]: value });
      }
    }
  });
  return knexBuilder;
};

var traverse = function(o, fn) {
  for (var i in o) {
    fn.apply(this, [i, o[i]]);
    // console.log("o[i]", o[i]);
    //console.log("isArrayo[i]", Array.isArray(o[i]));
    if (o[i] !== null && typeof o[i] == "object") {
      traverse(o[i], fn);
    }
  }
};

const isObject = value => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
const getParsedOrderBy = orderBy => {
  const orderByDirectives = Array.isArray(orderBy) ? orderBy : [orderBy];
  const parsedOrderBy = orderByDirectives.map(orderByDirective => {
    return {
      column: orderByDirective.split("_")[0],
      order: orderByDirective.split("_")[1]
    };
  });
  return parsedOrderBy;
};

const getTableName = (key, options) => {
  if (!options.relations) return key;
  if (!options.relations[key]) return key;
  return options.relations[key].table || key;
};

const getThroughTableName = (key, options) => {
  if (!options.relations) return null;
  if (!options.relations[key]) return null;
  return options.relations[key].through || null;
};

module.exports = knex => {
  const addFiltersFromWhereClause = (knexObj, { where }, options = {}) => {
    // const clonedKnexObject = knexObj.clone();

    if (where) {
      // Once mature...this needs to become recursive in order to traverse deep objects.
      Object.entries(where).forEach(([key, value]) => {
        // console.log("key", key);
        // console.log("value", value);
        if (isObject(value)) {
          //  && key.match(/_some$/)
          // DO NOTHING FOR OBJECTS FOR NOW.
          // Work in progress, only supporting _some for now. ^^^
          // const parentTableName = pluralize.singular(knexObj._single.table);
          // const relationKeyName = key.replace(/_some$/, "");
          // const relationTableName = getTableName(relationKeyName, options);
          // const childWhereClause = Array.isArray(value) ? value[0] : value;
          // console.log("childWhereClause", childWhereClause);
          // Object.entries(childWhereClause).forEach(
          //   ([relationKey, relationValue]) => {
          //     console.log("relationKey", relationKey);
          //     console.log("relationValue", relationValue);
          //     const operator = relationKey.match(/_(.*)/, "");
          //     const filterKey = operator ? operator[1] : "eq";
          //     const column = operator
          //       ? relationKey.replace(/_.*/, "")
          //       : relationKey;
          //     // const column = relationKey.replace(/_.*/, "");
          //     // const filterKey = operator[1];
          //     console.log("filterKey", filterKey);
          //     const filterData = FILTERS[filterKey];
          //     console.log("filterData", filterData);
          //     const methodName = filterData.method;
          //     const scopedWhereColumn = `${relationTableName}.${column}`;
          //     console.log("parentTableName", parentTableName);
          //     console.log("relationTableName", relationTableName);
          //     console.log("scopedWhereColumn", scopedWhereColumn);
          //     console.log("column", column);
          //     console.log("key", key);
          //     console.log("value", value);
          //     console.log("filterKey", filterKey);
          //     console.log("filterData", filterData);
          //     console.log("methodName", methodName);
          //     console.log("options", options);
          //     // const knexRelationObj = knex(relationTableName)
          //     //   [methodName](
          //     //     ...filterData.args(scopedWhereColumn, relationValue)
          //     //   )
          //     //   .select(`${parentTableName}Id`); // Follows our convention. Could be made more versatile via (underscored: true) option (or similar) or an explicit foreignKey passed otion
          //     // const throughTablename = getThroughTableName(key, options);
          //     // if (throughTablename) {
          //     //   // Needed for many-to-many relationships.
          //     //   console.log("through", throughTablename);
          //     //   const foreignKey = `${pluralize.singular(relationTableName)}Id`;
          //     //   console.log("foreignKey", foreignKey);
          //     //   console.log("relationTableName", relationTableName);
          //     //   knexRelationObj.innerJoin(
          //     //     throughTablename,
          //     //     `${throughTablename}.${foreignKey}`,
          //     //     `${relationTableName}.id`
          //     //   );
          //     // }
          //     // knexObj.whereIn("id", knexRelationObj);
          //     // _some query. First attempt at relational query
          //     const knexRelationObj = knex(relationTableName)
          //       [methodName](
          //         ...filterData.args(scopedWhereColumn, relationValue)
          //       )
          //       .select(`${parentTableName}Id`);
          //     const throughTablename = getThroughTableName(
          //       relationKeyName,
          //       options
          //     );
          //     console.log("throughTablename", throughTablename);
          //     if (throughTablename) {
          //       // Needed for many-to-many relationships.
          //       const foreignKey = `${pluralize.singular(relationTableName)}Id`;
          //       knexRelationObj.innerJoin(
          //         throughTablename,
          //         `${throughTablename}.${foreignKey}`,
          //         `${relationTableName}.id`
          //       );
          //     }
          //     // The following may be the only part needed to add for "_some" query. This will be more clear as I introduce more use-cases.
          //     // knexRelationObj.groupBy(`${parentTableName}Id`);
          //     // knexRelationObj.having(
          //     //   knex.raw(`count(*) = ${relationValue.length}`)
          //     // );
          //     knexObj.whereIn("id", knexRelationObj);
          //     console.log("knexObj", knexObj.toSQL());
          // const sql = knex("propertyAmenities")
          //   .select("propertyId")
          //   .innerJoin(
          //     "propertyAmenityProperties",
          //     "propertyAmenityProperties.propertyAmenityId",
          //     "propertyAmenities.id"
          //   )
          //   .whereIn("propertyAmenities.key", relationValue)
          //   .groupBy("propertyId")
          //   .having(knex.raw(`count(*) = ${relationValue.length}`))
          //   .toSQL();
          // console.log("sql", knexRelationObj.toSQL());
          /*
select *
from [properties]
where [id] in (
  select [propertyId]
  from [propertyAmenityProperties]
  inner join [propertyAmenities] on [propertyAmenities].[id] = [propertyAmenityProperties].[propertyAmenityId]
  where [propertyAmenities].[key] IN ('pool', 'elevator')
  group by [propertyId]
  HAVING COUNT(*) = 2
)

{
properties (where: {
  sleeps_gte: 10,
  sleeps_lte: 30,
  amenities: {
    key_some: ["pool", "elevator"]
  }
}) {
      id
  		sleeps
      name
      key
      # propertyGroup {
      #   key
      # }
      amenities {
        name
        key
      }
}
}

*/
          // knexObj.whereIn(
          //   "id",
          //   knex("propertyAmenities")
          //     .select("propertyId")
          //     .whereIn("propertyAmenities.key", value)
          //     .innerJoin(
          //       "propertyAmenityProperties",
          //       "propertyAmenityProperties.propertyAmenityId",
          //       "propertyAmenities.id"
          //     )
          // );
          // knexObj[methodName](...filterData.args(column, value));
          // }
          // );
        } else if (value !== null) {
          const operator = key.match(/_(.*)/, "");
          if (operator && FILTERS[operator[1]]) {
            const column = key.replace(/_.*/, "");
            const filterKey = operator[1];
            const filterData = FILTERS[filterKey];
            const methodName = filterData.method;
            knexObj[methodName](...filterData.args(column, value));
          } else {
            knexObj.where({ [key]: value });
          }
        }
      });
    }
    return knexObj;
  };

  const paginateAndSort = (knexObj, args, options = {}) => {
    const { where, orderBy, first, skip } = args;
    const { list = true } = options;
    const perPage = first || 5000; // TODO: Remove limits for relational queries eg whereIn()
    const offset = skip || 0;
    //    let knexObj = knex(table);

    // if (where) {
    //   Object.entries(where).forEach(([key, value]) => {
    //     const operator = key.match(/_(.*)/, "");
    //     if (operator && FILTERS[operator[1]]) {
    //       const column = key.replace(/_.*/, "");
    //       const filterKey = operator[1];
    //       const filterData = FILTERS[filterKey];
    //       const methodName = filterData.method;
    //       knexObj[methodName](...filterData.args(column, value));
    //     } else {
    //       knexObj.where({ [key]: value });
    //     }
    //   });
    // }

    // console.log("where", where);
    // traverse(where, function(k, v) {
    //   const grouping = GROUPS[k];
    //   console.log("grouping", grouping);
    //   if (grouping) {
    //     //   console.log("grouping", grouping);
    //     console.log("GROUP");
    //     transformWhereClauses(knexObj, v, grouping);
    //   } else {
    //     console.log("NOGROUP", k);
    //     transformWhereClauses(knexObj, { [k]: v });
    //   }
    // });
    // const fn = function() {
    //   this.where("id", 1).orWhereNot("id", ">", 10);
    // };
    // knexObj
    //   .whereNot(function() {
    //     fn.apply(this);
    //   })
    //   .orWhereNot("email", "like", "%natysik-kosma@gmailu%");
    // const fnGroup1 = function() {
    //   this.andWhere("email", "like", "%Konark%").andWhere(
    //     "email",
    //     "like",
    //     "%gmail%"
    //   );
    // };
    // const fnGroup2 = function() {
    //   this.orWhere("email", "like", "%natysik-kosma@gmailu%");
    // };
    // knexObj
    //   .where(function() {
    //     fnGroup1.apply(this);
    //   })
    //   .orWhere(function() {
    //     fnGroup2.apply(this);
    //   });

    // knexObj
    //   .andWhere("email", "like", "%Konark%")
    //   .andWhere("email", "like", "%gmail%")
    //   .orWhere("email", "like", "%natysik-kosma@gmailu%");

    // const knexBuilder = knexObj;
    // const knexBuilder = transformWhereClauses(knexObj, where);
    // Object.entries(where).forEach(([key, value]) => {
    //   const operator = key.match(/_(.*)/, "");
    //   console.log("value", value);
    //   if (operator) {
    //     const column = key.replace(/_.*/, "");
    //     console.log({ [column]: value });
    //     const filterKey = operator[1];
    //     console.log(FILTERS[filterKey]);
    //     const filterData = FILTERS[filterKey];
    //     console.log(filterData.args(column, value));
    //     knexObj[filterData.method](...filterData.args(column, value));
    //     // switch (operator[1]) {
    //     //   case "not":
    //     //     knexObj.whereNot({ [column]: value });
    //     //     break;
    //     // }
    //   } else {
    //     knexObj.where({ [key]: value });
    //   }
    //   console.log("key", key);
    //   console.log("operator", key.match(/_(.*)/, ""));
    // });

    // if (where) {
    //   knexObj.where(where);
    // }
    let mainQuery = knexObj.offset(offset).limit(perPage);
    if (orderBy) {
      mainQuery.orderBy(getParsedOrderBy(orderBy));
    } else if (options.defaultOrderBy) {
      mainQuery.orderBy(getParsedOrderBy(options.defaultOrderBy));
    } else if (offset) {
      const hasOrderBy = mainQuery._statements.find(
        statement => statement.grouping === "order"
      );
      if (!hasOrderBy) {
        throw new Error("orderBy required when paging records.");
      }
    }

    if (!list) {
      //console.log("IN", list);
      mainQuery.first();
    }
    // console.log("mainQuery", mainQuery);
    return mainQuery;
  };
  return {
    futureProof(args) {
      // Future proofing for knexQL, since we are handling this object here. knexQL may support complex object nesting filters in future.
      const futureProofed = { ...args };
      const { where = {} } = futureProofed;
      futureProofed.where = Object.entries(where).reduce(
        (acc, [key, value]) => {
          if (!isObject(value)) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );
      return futureProofed;
    },
    resolve(knexOrTableName, args, options) {
      const knexObj =
        typeof knexOrTableName === "string"
          ? knex(knexOrTableName)
          : knexOrTableName;
      const filteredQuery = addFiltersFromWhereClause(knexObj, args, options);
      return paginateAndSort(filteredQuery, args, options);
    },
    connection(knexOrTableName, args, options) {
      const knexObj =
        typeof knexOrTableName === "string"
          ? knex(knexOrTableName)
          : knexOrTableName;
      const { first, skip } = args;
      const perPage = first || 50;
      // const mainQuery = paginateAndSort(table, args, options);
      const filteredQuery = addFiltersFromWhereClause(knexObj, args, options);
      // const clonedQuery = filteredQuery.clone();
      // clonedQuery._statements
      const getCountQuery = mainKnexObject => {
        const clonedQuery = mainKnexObject
          .clone()
          //.clearSelect()
          .clearOrder();
        // clonedQuery._statements = clonedQuery._statements.filter(statement => {
        //   return statement.grouping !== "columns";
        // });
        const countQuery = knex
          .count("* as count")
          .from(clonedQuery.as("knexQLCountTbl"))
          .first();
        return countQuery;
      };

      const countQuery = getCountQuery(filteredQuery);
      const finalQuery = paginateAndSort(filteredQuery, args, options);
      return Promise.all([countQuery, finalQuery]).then(([total, rows]) => {
        const nodes = rows.map(row => {
          return {
            cursor: row.id,
            node: row
          };
        });
        const connection = {
          aggregate: {
            count: total.count
          },
          pageInfo: {
            hasNextPage: skip + perPage < total.count,
            hasPreviousPage: skip > 0,
            startCursor: rows.length ? rows[0].id : null,
            endCursor: rows.length ? rows[rows.length - 1].id : null
          },
          edges: nodes
        };
        return connection;
      });
    }
  };
};
