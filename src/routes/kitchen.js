const express = require('express');
const router = express.Router();
const {
  getKitchenOrders,
  updateKitchenOrderStatus,
} = require('../controllers/kitchenController');

router.get('/orders', getKitchenOrders);
router.patch('/orders/:id', updateKitchenOrderStatus);

module.exports = router;