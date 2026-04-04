const pool = require('../db/pool');

// POST /api/sessions/open
const openSession = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // check if session already open for this user
    const existing = await pool.query(
      'SELECT * FROM pos_sessions WHERE opened_by = $1 AND status = $2',
      [userId, 'open']
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Session already open for this user' });
    }

    const sessionId = 'sess' + Date.now();

    const result = await pool.query(
      'INSERT INTO pos_sessions (id, opened_by, status) VALUES ($1, $2, $3) RETURNING *',
      [sessionId, userId, 'open']
    );

    res.status(201).json({
      message: 'Session opened',
      session: result.rows[0],
    });
  } catch (err) {
    console.error('Open session error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/sessions/close
const closeSession = async (req, res) => {
  const { sessionId, closingAmount } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE pos_sessions 
       SET status = $1, closed_at = NOW(), closing_amount = $2 
       WHERE id = $3 AND status = 'open'
       RETURNING *`,
      ['closed', closingAmount || 0, sessionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or already closed' });
    }

    res.json({
      message: 'Session closed',
      session: result.rows[0],
    });
  } catch (err) {
    console.error('Close session error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/sessions
const getAllSessions = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pos_sessions ORDER BY opened_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get sessions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { openSession, closeSession, getAllSessions };