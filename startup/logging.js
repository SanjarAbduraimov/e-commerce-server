require("express-async-errors");
module.exports = function () {
  process.on("uncaughtException", (ex) => {
    // should log to file
    console.log(ex);
    process.exit(1);
  });
  process.on("unhandledRejection", (rej) => {
    throw rej;
  });
};
