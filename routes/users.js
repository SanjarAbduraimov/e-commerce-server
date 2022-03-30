const express = require("express");
const router = express.Router();
const controllers = require("../controllers/users");
const multer = require("../configs/multer");

/* GET home page. */
router.get("/", controllers.fetchAllUsers);
router.post("/add-user", multer.single("img"), controllers.createUser);
router.get("/delete", controllers.deleteAllUsers);
router.get("/:id", controllers.fetchUserById);
router.post("/:id/edit", multer.single("img"), controllers.updateUserById);
router.get("/:id/delete", controllers.deleteUserById);
router.post("/:id/change-auth", controllers.changeUserAuth);

module.exports = router;
