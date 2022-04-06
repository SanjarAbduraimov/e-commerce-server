const express = require('express');
const router = express.Router();
const controllers = require('../controllers/orders');

/* GET home page. */
router.get('/', controllers.fetchAll);
router.post('/', controllers.create);
router.get('/:id', controllers.fetchById);
router.get('/customer/:id', controllers.fetchByCustomerId);
router.delete('/:id/delete', controllers.deleteById);
router.put('/:id/change-status', controllers.changeStatusById);
router.get('/search/:query/:page', controllers.search);

module.exports = router;