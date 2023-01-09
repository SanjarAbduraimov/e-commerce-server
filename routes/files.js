const express = require("express");
const router = express.Router();
const controllers = require("../controllers/files");
const multer = require("../utils/multer");
const { authHandler } = require("../utils/index");

/* GET home page. */
router.get("/", controllers.fetchAllFiles);
router.post("/", authHandler, multer.array("files"), controllers.createFiles);
router.post("/base64", authHandler, controllers.createBase64Files);
router.get("/:id", controllers.fetchFilesById);
router.patch("/delete", authHandler, controllers.deleteById);

module.exports = router;
