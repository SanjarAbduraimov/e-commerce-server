const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const { GridFsStorage } = require("multer-gridfs-storage");
// const fileUpload = (req, res, next) => {
//   const storage = multer.diskStorage({
//     filename: function (req, file, cb) {
//       const {
//         edit = false,
//         createdAt = Date.now(),
//         updatedAt = Date.now(),
//         name = "images",
//         oldImg = "",
//       } = req.body;

//       try {
//         if (edit || req.url.endsWith("edit")) {
//           let dir = `public${oldImg}`;
//           // if (process.env.NODE_ENV !== "development") {
//           //   dir = `/var/www/${oldImg}/`;
//           // }
//           const fielExist = fs.existsSync(dir);
//           cb(
//             null,
//             `${
//               name.toLowerCase().replace(/\s+/g, "-") + updatedAt
//             }-edited${path?.extname(file.originalname)}`
//           );

//           if (fielExist && oldImg) {
//             fs.unlinkSync(dir);
//           }
//         } else {
//           cb(
//             null,
//             `${`${name
//               .toLowerCase()
//               .replace(/\s+/g, "-")}-${createdAt}`}${path?.extname(
//               file.originalname
//             )}`
//           );
//         }
//       } catch (error) {
//         cb(error);
//       }
//     },

//     destination: function (req, file, cb) {
//       const { name = "product" } = req.body;
//       let dir = `public/uploads/${name}/`;

//       // if (process.env.NODE_ENV !== "development") {
//       //   dir = `/var/www/uploads/${name}/`;
//       // }

//       if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//       }
//       cb(null, dir);
//     },
//   });

//   const upload = multer({ storage }).single("img");
//   upload(req, res, (err) => {
//     if (err) {
//       console.log(err);
//       return res.status(400).json({ success: false, msg: err.message });
//     }
//     next();
//   });
// };

// module.exports = fileUpload;
const mongoURI = process.env.GFS_DB_URI || "mongodb://localhost/shopzone-files";
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    console.log(file);
    console.log(req.body, "GridFsStorage");
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({
  storage,
});
module.exports = upload;
