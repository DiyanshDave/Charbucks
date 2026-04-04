const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getAllPayments,
} = require('../controllers/paymentController');

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.get('/', getAllPayments);

module.exports = router;