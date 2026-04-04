const pool = require('../db/pool');

// POST /api/orders
const createOrder = async (req, res) => {
  const { tableId, items, totalAmount } = req.body;

  if (!tableId || !items || !totalAmount) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const orderId = 'o' + Date.now();

    await pool.query(
      'INSERT INTO orders (order_id, table_id, status, total_amount) VALUES ($1, $2, $3, $4)',
      [orderId, tableId, 'created', totalAmount]
    );

    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES ($1, $2, $3, $4, $5)',
        [orderId, item.productId, item.name, item.price, item.quantity]
      );
    }

    // mark table occupied
    await pool.query(
      'UPDATE floor_tables SET status = $1 WHERE id = $2',
      ['occupied', tableId]
    );

    res.status(201).json({ orderId, status: 'created' });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const ordersResult = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );

    const orders = ordersResult.rows;

    for (const order of orders) {
      const itemsResult = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.order_id]
      );
      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/orders/:id/send — send to kitchen
const sendToKitchen = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
      ['to_cook', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order sent to kitchen', status: 'to_cook' });
  } catch (err) {
    console.error('Send to kitchen error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PATCH /api/orders/:id — update status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ['created', 'to_cook', 'preparing', 'completed', 'paid', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    // if cancelling — free the table first
    if (status === 'cancelled') {
      // find which table this order belongs to
      const orderResult = await pool.query(
        'SELECT table_id FROM orders WHERE order_id = $1',
        [id]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const tableId = orderResult.rows[0].table_id;

      // free the table
      await pool.query(
        'UPDATE floor_tables SET status = $1 WHERE id = $2',
        ['available', tableId]
      );
    }

    // update order status
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  sendToKitchen,
  updateOrderStatus,
};