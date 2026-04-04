const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  sendToKitchen,
  updateOrderStatus,
} = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getAllOrders);
router.post('/:id/send', sendToKitchen);
router.patch('/:id', updateOrderStatus);

module.exports = router;