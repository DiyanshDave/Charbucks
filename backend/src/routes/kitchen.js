const express = require('express');
const router = express.Router();
const {
  getKitchenOrders,
  updateKitchenOrderStatus,
  getCompletedOrders,
} = require('../controllers/kitchenController');

router.get('/orders', getKitchenOrders);
router.get('/orders/completed', getCompletedOrders);
router.patch('/orders/:id', updateKitchenOrderStatus);

module.exports = router;