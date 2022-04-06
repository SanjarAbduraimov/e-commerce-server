const express = require('express');
const router = express.Router();
const controllers = require('../controllers/categories');
const multer = require('../configs/multer');

/* GET home page. */
router.get('/', controllers.fetchCategories);
router.post('/', multer.single('img'), controllers.addCategory);
router.get('/:slug', controllers.findBySlug);
router.get('/:id/edit', controllers.findById);
router.put('/:id', multer.single('img'), controllers.updateCategory);
router.delete('/:id', controllers.removeCategory);

module.exports = router;