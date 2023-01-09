const fs = require("fs");
const Files = require("../models/files");
const { webImgtoFile, resizeImg } = require("../utils");
const ObjectId = require("mongodb").ObjectId;
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const fsDatabase =
  process.env.GFS_DB_URI || "mongodb://localhost:27017/shopzone-files";
const connection = mongoose.createConnection(fsDatabase);
function createFileUrl(req, url) {
  if (url) {
    const imageUrl =
      req.protocol + "://" + req.headers.host + url.replace("public", "");
    return imageUrl;
  }
  return "";
}

exports.fetchAllFiles = async (req, res) => {
  try {
    let gfs;
    gfs = Grid(connection.db, mongoose.mongo);

    let id = new ObjectId("63b96954480056f46d0e239f");
    gfs.collection("uploads").findOne({}, (err, file) => {
      if (err) {
        // report the error
        console.log(err);
      } else {
        return gfs.files.find().toArray((err, files) => {
          // Check if files
          if (!files || files.length === 0) {
            return res.json(files);
            res.render("index", { files: false });
          } else {
            files.map((file) => {
              if (
                file.contentType === "image/jpeg" ||
                file.contentType === "image/png"
              ) {
                file.isImage = true;
              } else {
                file.isImage = false;
              }
            });
            // return res.sendFile("hello.txt");
            // return res.("index", { files: files });
          }
        });
        // return res.json(file);
        // return gfs
        //   .createReadStream({ filename: "46b15b760521e00a755e44ad10419c21.jpg" })
        //   .pipe(res);
        // detect the content type and set the appropriate response headers.
        // let mimeType = file.contentType;
        // if (!mimeType) {
        //   mimeType = mime.lookup(file.filename);
        // }
        // res.set({
        //   "Content-Type": mimeType,
        //   "Content-Disposition": "attachment; filename=" + file.filename,
        // });

        // const readStream = gfs.createReadStream({
        //   _id: id,
        // });
        // readStream.on("error", (err) => {
        //   // report stream error
        //   console.log(err);
        // });
        // // the response will be the file itself.
        // readStream.pipe(res);
      }
    });
    const { page = 1, size = 10 } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: size,
      sort: {
        name: 1,
      },
      pagination: page == "-1" ? false : true,
    };

    const { docs, ...pagination } = await Files.paginate({}, options);
    return res.json({
      payload: docs,
      pagination,
      success: true,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.fetchFilesById = (req, res) => {
  const { id } = req.params;

  Files.findById(id)
    .then((data) => {
      res.json({
        payload: data,
      });
    })
    .catch((err) => res.status(500).json(err));
};

exports.createFiles = async (req, res) => {
  try {
    if (!req.body.files.length) {
      return res.status(400).json({
        success: false,
        msg: "NO files to upload",
      });
    }
    const { _id } = req.locals;
    const files = await Promise.all(
      req.files.map(async (item) => {
        const { path, originalname, size, mimetype } = item;
        try {
          await resizeImg(item); //resize file before save
          return {
            size,
            mimetype,
            url: createFileUrl(req, path),
            filename: originalname,
            _id,
          };
        } catch (err) {
          return Promise.reject(err);
        }
      })
    );
    const data = await Files.insertMany(files);
    if (req.body?.oldImg?.length) {
      deleteImgaes(req.body.oldImg);
    }
    return res.status(201).json({
      success: true,
      payload: data,
      msg: "File created",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error,
    });
  }
};

exports.createBase64Files = async (req, res) => {
  const { center } = req.locals;

  if (!req.body.files.length) {
    return res.json({
      success: false,
      msg: "NO files to upload",
    });
  }

  const files = await Promise.all(
    req.body.files?.map(async (item) => {
      const imagePath = webImgtoFile(item);
      const newFile = await resizeImg(imagePath); //resize file before save
      return {
        mimetype: "image/jpeg",
        url: createFileUrl(req, imagePath),
        filename: "base64 image",
        center,
      };
    })
  );

  return Files.insertMany(files)
    .then((data) => {
      if (req.body?.oldImg?.length) {
        deleteImgaes(req.body.oldImg);
      }
      return res.json({
        success: true,
        payload: data,
        msg: "FIle_created",
      });
    })
    .catch((err) => {
      res.json({
        success: false,
        msg: err.message,
      });
    });
};

exports.deleteById = (req, res) => {
  const { files } = req.body;
  Files.updateMany(
    {
      _id: {
        $in: files,
      },
    },
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  )
    .then(() => {
      res.json({
        success: true,
        msg: "Successfully deleted",
      });
    })
    .catch((err) => res.status(500).json(err));
};

function deleteImgaes(imageUrl) {
  if (imageUrl.length) {
    const url = `public${imageUrl.slice(imageUrl.indexOf("/uploads"))}`;

    const isFileExist = fs.existsSync(url);
    if (isFileExist) {
      fs.unlink(url, (err) => {
        if (err) {
          console.log(err);
        }
        Files.findOneAndDelete({
          url: imageUrl,
        })
          .then((res) => {
            console.log("Image is deleted");
          })
          .catch((err) => console.log(err));
      });
    }
  }
}
