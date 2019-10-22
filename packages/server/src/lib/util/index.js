const moment = require("moment");
const MASTER_PLATFORM = "homeaway";

module.exports = {
  isMasterplatformBlock: calendarEvent => {
    const platformKey = calendarEvent.platformKey;
    const summary = calendarEvent.summary;
    return platformKey === MASTER_PLATFORM && summary.indexOf("Blocked") === 0;
  },

  getIsInHouse: ipaddress => {
    //console.log("process.env.NODE_ENV", process.env.NODE_ENV);
    // if (process.env.NODE_ENV === "development") {
    //   return true;
    // }
    return ipaddress.match(
      /^(10.233.|209.60.76.|209.60.176.|::1|::ffff:127.0.0.1|127.0.0.1)/
    )
      ? true
      : false;
  },

  maskSummaryText: summaryText => {
    if (summaryText.match(/Blocked/gi)) {
      return "Blocked";
    } else if (summaryText.match(/Closed/gi)) {
      return "Closed";
    }
    return "Reserved";
  },

  getDatesInRange: (startDate, stopDate) => {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
      dateArray.push(moment(currentDate).format("YYYY-MM-DD"));
      currentDate = moment(currentDate).add(1, "days");
    }
    return dateArray;
  }
};

module.exports.fileUploader = require("./fileUploader");

// errorSchema (error) {
//   let res = {
//     errors: [error],
//     status: status[statusCode],
//   }

//   return res
// }
