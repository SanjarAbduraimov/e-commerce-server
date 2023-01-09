const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const app = express();
// const fileGateWay = express();

const port = process.env.PORT || 9999;
const database = process.env.DB_URI || "mongodb://localhost/shopzone";

dotenv.config({ path: path.resolve(__dirname, "./.env") });
require("./startup/logging")();
require("./startup/routes")(app, database);
require("./startup/db")(database);

app.listen(port, () =>
  console.log(`App is running on server localhost: ${port}`)
);
// fileGateWay.listen(9000, () =>
//   console.log(`File Api is running on server localhost: ${9000}`)
// );
module.exports = app;
