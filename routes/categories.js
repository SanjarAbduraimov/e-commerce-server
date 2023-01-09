const express = require("express");
const router = express.Router();
const controllers = require("../controllers/categories");

/* GET home page. */
router.get("/", controllers.fetchCategories);
router.post("/", controllers.addCategory);
router.get("/:slug", controllers.findBySlug);
router.get("/:id/edit", controllers.findById);
router.put("/:id", controllers.updateCategory);
router.delete("/:id", controllers.removeCategory);

module.exports = router;
