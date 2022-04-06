const express = require('express');
const router = express.Router();
const controllers = require('../controllers/favourites');

/* GET home page. */
router.get('/all/:id', controllers.fetchAll);
router.post('/', controllers.create);
router.delete('/:productId', controllers.deleteById);

module.exports = router;