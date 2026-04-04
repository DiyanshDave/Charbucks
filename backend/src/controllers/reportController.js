const pool = require('../db/pool');

// GET /api/reports
const getReports = async (req, res) => {
  const { from, to, sessionId, productId, status } = req.query;

  try {
    let query = `
      SELECT 
        o.order_id,
        o.table_id,
        o.status,
        o.total_amount,
        o.created_at,
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
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (from) {
      query += ` AND o.created_at >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      query += ` AND o.created_at <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    if (status) {
      query += ` AND o.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (sessionId) {
      query += `
        AND o.created_at BETWEEN (
          SELECT opened_at FROM pos_sessions WHERE id = $${paramIndex}
        ) AND (
          SELECT COALESCE(closed_at, NOW()) FROM pos_sessions WHERE id = $${paramIndex}
        )
      `;
      params.push(sessionId);
      paramIndex++;
    }

    if (productId) {
      query += `
        AND o.order_id IN (
          SELECT order_id FROM order_items WHERE product_id = $${paramIndex}
        )
      `;
      params.push(productId);
      paramIndex++;
    }

    query += ' GROUP BY o.order_id ORDER BY o.created_at DESC';

    const ordersResult = await pool.query(query, params);
    const orders = ordersResult.rows;

    // total revenue — only paid orders
    const totalRevenue = orders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.total_amount, 0);

    // total orders
    const totalOrders = orders.length;

    // paid orders count
    const paidOrders = orders.filter((o) => o.status === 'paid').length;

    // pending orders count (not paid)
    const pendingOrders = orders.filter((o) => o.status !== 'paid').length;

    // best selling products
    const productSales = {};
    orders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item) => {
          if (!item.product_id) return;
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = {
              productId: item.product_id,
              name: item.name,
              totalQuantity: 0,
              totalRevenue: 0,
            };
          }
          productSales[item.product_id].totalQuantity += item.quantity;
          productSales[item.product_id].totalRevenue +=
            item.price * item.quantity;
        });
      }
    });

    const bestSellingProducts = Object.values(productSales).sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );

    res.json({
      summary: {
        totalOrders,
        paidOrders,
        pendingOrders,
        totalRevenue,
      },
      bestSellingProducts,
      orders,
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/reports/dashboard
const getDashboard = async (req, res) => {
  try {
    // today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // today's orders
    const todayOrders = await pool.query(
      `SELECT * FROM orders WHERE created_at BETWEEN $1 AND $2`,
      [todayStart, todayEnd]
    );

    // today's revenue
    const todayRevenue = todayOrders.rows
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.total_amount, 0);

    // total orders all time
    const allOrders = await pool.query('SELECT COUNT(*) FROM orders');

    // active tables right now
    const activeTables = await pool.query(
      `SELECT COUNT(*) FROM floor_tables WHERE status = 'occupied'`
    );

    // available tables
    const availableTables = await pool.query(
      `SELECT COUNT(*) FROM floor_tables WHERE status = 'available'`
    );

    // pending kitchen orders
    const kitchenOrders = await pool.query(
      `SELECT COUNT(*) FROM orders WHERE status IN ('to_cook', 'preparing')`
    );

    // recent 5 orders
    const recentOrders = await pool.query(
      `SELECT * FROM orders ORDER BY created_at DESC LIMIT 5`
    );

    res.json({
      today: {
        totalOrders: todayOrders.rows.length,
        totalRevenue: todayRevenue,
      },
      allTime: {
        totalOrders: parseInt(allOrders.rows[0].count),
      },
      tables: {
        occupied: parseInt(activeTables.rows[0].count),
        available: parseInt(availableTables.rows[0].count),
      },
      kitchen: {
        pendingOrders: parseInt(kitchenOrders.rows[0].count),
      },
      recentOrders: recentOrders.rows,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getReports, getDashboard };