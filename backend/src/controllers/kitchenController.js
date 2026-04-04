const pool = require('../db/pool');

// GET /api/kitchen/orders
// returns only active kitchen orders (to_cook and preparing)
const getKitchenOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.order_id,
        o.table_id,
        o.status,
        o.total_amount,
        o.created_at,
        ft.name as table_name,
        json_agg(
          json_build_object(
            'product_id', oi.product_id,
            'name', oi.name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN floor_tables ft ON o.table_id = ft.id
      WHERE o.status IN ('to_cook', 'preparing')
      GROUP BY o.order_id, ft.name
      ORDER BY o.created_at ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Kitchen orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PATCH /api/kitchen/orders/:id
// chef updates status: to_cook → preparing → completed
const updateKitchenOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['preparing', 'completed'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Kitchen can only set status to preparing or completed' 
    });
  }

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: `Order marked as ${status}`,
      order: result.rows[0],
    });
  } catch (err) {
    console.error('Kitchen update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/kitchen/orders/completed
// recently completed orders (last 20)
const getCompletedOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.order_id,
        o.table_id,
        o.status,
        o.total_amount,
        o.created_at,
        ft.name as table_name,
        json_agg(
          json_build_object(
            'product_id', oi.product_id,
            'name', oi.name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN floor_tables ft ON o.table_id = ft.id
      WHERE o.status = 'completed'
      GROUP BY o.order_id, ft.name
      ORDER BY o.created_at DESC
      LIMIT 20
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Completed orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getKitchenOrders,
  updateKitchenOrderStatus,
  getCompletedOrders,
};