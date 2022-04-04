const express = require("express");
const router = express.Router();
const controllers = require("../controllers/products");
const multer = require("../configs/multer");

/* GET home page. */
router.get("/", controllers.fetchAllProducts);
// router.get("/featured", controllers.fetchFeaturedProducts);
// router.get("/public", controllers.fetchPublicProducts);
// router.get("/get-all", controllers.fetchAllProductsForMobileApp);
router.post(
  "/",
  multer.single("img"),

  controllers.createNewProducts
);
router.get("/delete-all", controllers.deleteAllProducts);
router.get("/:id", controllers.fetchProductsById);
// router.get("/public/:id", controllers.fetchPublicProductsById);
router.put("/:id/edit", multer.single("img"), controllers.updateProductsById);
router.delete("/:id/delete", controllers.deleteProductsById);
// router.get("/search/all/:query", controllers.searchMobile);
router.get("/search/:query/:page", controllers.search);
router.get(
  "/category/:category/(:page)?",
  controllers.fetchAllProductsByCategory
);
// router.get("/mobile/category/:category", controllers.searchCategory);

module.exports = router;