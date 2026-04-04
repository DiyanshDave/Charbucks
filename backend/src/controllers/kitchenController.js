const pool = require('../db/pool');

// GET /api/kitchen/orders
const getKitchenOrders = async (req, res) => {
  try {
    const ordersResult = await pool.query(`
      SELECT order_id, table_id, status, total_amount, created_at
      FROM orders
      WHERE status IN ('to_cook', 'preparing')
      ORDER BY created_at ASC
    `);

    const orders = ordersResult.rows;

    const enriched = await Promise.all(orders.map(async (order) => {
      const itemsResult = await pool.query(
        `SELECT product_id, name, price, quantity FROM order_items WHERE order_id = $1`,
        [order.order_id]
      );
      return {
        orderId: order.order_id,
        tableId: order.table_id,
        status: order.status,
        totalAmount: order.total_amount,
        createdAt: order.created_at,
        items: itemsResult.rows,
      };
    }));

    res.json(enriched);
  } catch (err) {
    console.error('getKitchenOrders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PATCH /api/kitchen/orders/:id
const updateKitchenOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ['preparing', 'completed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Kitchen can only set status to: preparing, completed' });
  }

  try {
    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING order_id, status`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderId: result.rows[0].order_id,
      status: result.rows[0].status,
    });
  } catch (err) {
    console.error('updateKitchenOrderStatus error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getKitchenOrders, updateKitchenOrderStatus };