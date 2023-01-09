const mongoose = require("mongoose");

module.exports = function (database) {
  mongoose
    .connect(database, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => {
      console.log("Database loaded successfully");
    });
  // const fsDatabase =
  //   process.env.GFS_DB_URI || "mongodb://localhost/shopzone-files";
  // mongoose
  //   .createConnection(fsDatabase, {
  //     useNewUrlParser: true,
  //     useFindAndModify: false,
  //     useUnifiedTopology: true,
  //     useCreateIndex: true,
  //   })
  //   .then(() => {
  //     console.log("File Upload Database loaded successfully");
  //   }).catch(err=> {
  //       console.log(err, 'err');
  //   });
};
