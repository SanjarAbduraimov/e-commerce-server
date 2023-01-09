// const mongoose = require("mongoose");

// const { Schema } = mongoose;
// const mongoosePaginate = require("mongoose-paginate-v2");

// const filesSchema = Schema(
//   {
//     filename: String,
//     url: { type: String, require: true },
//     mimitype: String,
//     mimetype: String,
//     size: Number,
//     isDeleted: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// filesSchema.plugin(mongoosePaginate);

// const files = mongoose.model("File", filesSchema);

// module.exports = files;
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const conn = mongoose.connection.useDb("shopzone-files");
let gfs;
conn.once("open", () => {
// Init stream
gfs = new Grid(conn.db, mongoose.mongo);
gfs.collection("uploads");
});

// conn.once("open", () => {
//   console.log(conn.db, "hdbhdfbdfhbv");
//   gridfs - stream;
//   gfs = new mongoose.mongo.GridFSBucket(conn.db, {
//     bucketName: "uploads",
//   });
//   gfs.c;
// });
// console.log(conn);
module.exports = gfs;
