const express = require("express");
const router = express.Router();
const controllers = require("../controllers/products");
const fileUpload = require("../configs/multer");

/* GET home page. */
router.get("/", controllers.fetchAllProducts);
router.get("/public", controllers.fetchPublicProducts);
router.post("/", fileUpload, controllers.createNewProducts);
router.get("/delete-all", controllers.deleteAllProducts);
router.get("/:id", controllers.fetchProductsById);
router.put("/:id/edit", fileUpload, controllers.updateProductsById);
router.delete("/:id/delete", controllers.deleteProductsById);
router.get("/search/:query/:page", controllers.search);
router.get(
  "/category/:category/(:page)?",
  controllers.fetchAllProductsByCategory
);

module.exports = router;
