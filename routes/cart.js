const express = require('express');
const router = express.Router();
const controllers = require('../controllers/cart');

/* GET home page. */
router.get('/', controllers.fetchAllCarts);
router.post('/', controllers.createCart);
router.get('/:id', controllers.fetchCartById);
router.post('/:id/add', controllers.addToCartById);
router.put('/:id/remove', controllers.removeItem);
router.delete('/:id/empty', controllers.clearCart);

module.exports = router;