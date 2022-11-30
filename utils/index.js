const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const { baseUrl } = require("../utils");
const { SECRET_KEY, RESET_PASSWORD_KEY } = require("../constants");
const mongoose = require("mongoose");
const User = require("../models/users");
const ObjectId = require("mongodb").ObjectId;

exports.baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:9999"
    : "https://api.myloadmanager.com";

exports.getImgPath = (img) => {
  let dir = img.includes("public") ? `../${img}` : `../public${img}`;
  if (img.includes("http")) {
    img = img.split("/");
    dir = `../public/${img[img.length - 2]}/${img[img.length - 1]}`;
  }
  if (process.env.NODE_ENV == "production") {
    dir = `/var/www/${img}/`;
  }
  return path.join(__dirname, dir);
};

exports.deleteImg = (img) => {
  if (typeof img == "object") {
    img.forEach((i) => {
      const imgPath = this.getImgPath(i);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });
    console.log("Files deleted");
  } else {
    const imgPath = this.getImgPath(img);
    if (fs.existsSync(imgPath) && img) {
      fs.unlinkSync(imgPath);
      console.log("File deleted");
    }
  }
};

exports.createFileUrl = (req, url) => {
  if (url) {
    const prototcol = process.env.NODE_ENV == "development" ? "http" : "https";
    const imageUrl =
      prototcol + "://" + req.headers.host + url.replace("public", "");
    return imageUrl;
  }
  return "";
};

exports.resizeImg = (img, imgType) => {
  if (img) {
    const { path: imgPath, destination, filename } = img;
    const customeSize = {
      width: 200,
      height: 200,
    };
    const fileExtension = path.extname(filename);
    const imgName = filename.slice(0, filename.lastIndexOf("."));
    const newImgPath = `${destination + imgName}-resized${fileExtension}`;

    return sharp(imgPath)
      .resize({
        ...customeSize,
        fit: "contain",
        background: "#ffffff",
      })
      .jpeg({
        quality: 50,
        force: false,
      })
      .png({
        quality: 50,
        force: false,
      })
      .toFile(newImgPath)
      .then(() => {
        this.deleteImg(imgPath);
        return newImgPath;
      })
      .catch((err) => console.log("ERRRO", err));
  }
};

exports.imgFileFromBase64 = (dataurl, filename) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, {
    type: mime,
  });
};

exports.webImgtoFile = (str, category, name, edit, oldImg) => {
  const dir = `public/uploads/${category}/`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
  }
  const fileName = name.toLowerCase().replace(/\s+/g, "-");
  if (!edit) {
    const data = Buffer.from(
      str.replace(/^data:image\/jpeg;base64,/, ""),
      "base64"
    );
    fs.writeFileSync(`./public/uploads/${category}/${fileName}.jpg`, data);
    return `${baseUrl}/uploads/${category}/${fileName}.jpg`;
  }
  const fielExist = fs.existsSync(`public${oldImg}`);

  if (fielExist && oldImg) {
    fs.unlinkSync(`public${oldImg}`);
  }
  const data = Buffer.from(
    str.replace(/^data:image\/jpeg;base64,/, ""),
    "base64"
  );
  fs.writeFileSync(`./public/uploads/${category}/${fileName}-edited.jpg`, data);
  return `${baseUrl}/uploads/${category}/${fileName}-edited.jpg`;
};

exports.authHandler = async (req, res, next) => {
  try {
    const whiteList = ["/auth/sign-in", "/auth/sign-up", "/products/public"];
    const isGetFileURL = req.url.startsWith("/uploads") && req.method === "GET";
    console.log(req.url);

    if (!whiteList.includes(req.url)) {
      console.log(whiteList.includes(req.url));
      const token = req.headers.authorization?.split(" ")[1];
      const validToken = token ? this.validateToken(token) : {};
      const userId = validToken?._id;
      console.log(userId, "userId", validToken);
      if (userId) {
        const role = validToken?.role;
        const user = await User.findById(userId);
        if (!user) {
          return res.status(401).json({
            type: "auth",
            msg: "You need to login/sign up first",
            success: false,
          });
        }
        if (user.isDeleted)
          return res.json({
            success: false,
            msg: "your profile has been deleted",
          });
        let admin = role == "admin" ? userId : user?.admin;
        req.locals = {
          role: role || "user",
          _id: userId,
          admin: ObjectId(admin),
        };
        return next();
      }
      return res.status(401).json({
        type: "auth",
        msg: "You need to login/sign up first",
        success: false,
      });
    }
    return next();
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

exports.createToken = (userData, type = "auth") => {
  if (type == "password") {
    return jwt.sign({ ...userData }, RESET_PASSWORD_KEY, { expiresIn: "15m" });
  }
  return jwt.sign({ ...userData }, SECRET_KEY, { expiresIn: "12h" });
};

exports.validateToken = (token, type = "auth") => {
  try {
    const key = type == "password" ? RESET_PASSWORD_KEY : SECRET_KEY;
    return jwt.verify(token, key);
  } catch (err) {
    console.log(err);
    return {};
  }
};

exports.getModelName = (role) => {
  const collectionName =
    role.slice(0, 1).toUpperCase() + role.slice(1, role.length);
  return role == "admin" ? "user" : collectionName;
};
