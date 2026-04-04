const pool = require('../db/pool');

// GET /api/reports
// supports filters: from, to, sessionId, productId
const getReports = async (req, res) => {
  const { from, to, sessionId, productId } = req.query;

  try {
    let query = `
      SELECT 
        o.order_id,
        o.table_id,
        o.status,
        o.total_amount,
        o.created_at,
        json_agg(oi.*) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // filter by date range
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

    // filter by session
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

    // filter by product
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

    const result = await pool.query(query, params);

    // calculate summary
    const totalOrders = result.rows.length;
    const totalRevenue = result.rows.reduce(
      (sum, row) => sum + row.total_amount,
      0
    );

    res.json({
      summary: {
        totalOrders,
        totalRevenue,
      },
      orders: result.rows,
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getReports };