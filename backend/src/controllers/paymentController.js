const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../db/pool');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
// frontend calls this first to get a razorpay order id
const createRazorpayOrder = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' });
  }

  try {
    // get order from DB
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE order_id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    if (order.status === 'paid') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // create razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: order.total_amount * 100, // razorpay needs amount in paise
      currency: 'INR',
      receipt: orderId,
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId,
    });
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/payments/verify
// frontend calls this after user completes payment on razorpay
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
    method,
  } = req.body;

  try {
    // verify signature — this confirms payment is genuine
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // payment is genuine — save to DB
    const paymentId = 'pay' + Date.now();

    await pool.query(
      'INSERT INTO payments (payment_id, order_id, method, status) VALUES ($1, $2, $3, $4)',
      [paymentId, orderId, method || 'UPI', 'success']
    );

    // mark order as paid
    const orderResult = await pool.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
      ['paid', orderId]
    );

    // mark table as available
    await pool.query(
      'UPDATE floor_tables SET status = $1 WHERE id = $2',
      ['available', orderResult.rows[0].table_id]
    );

    res.json({
      paymentId,
      status: 'success',
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/payments
const getAllPayments = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createRazorpayOrder, verifyPayment, getAllPayments };