const pool = require('../db/pool');

// GET /api/tables
const getAllTables = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM floor_tables');
    res.json(result.rows);
  } catch (err) {
    console.error('Get tables error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/tables
const createTable = async (req, res) => {
  const { id, name, seats } = req.body;

  if (!id || !name || !seats) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO floor_tables (id, name, seats, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, seats, 'available']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create table error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PATCH /api/tables/:id  — update status (available / occupied)
const updateTableStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ['available', 'occupied'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Status must be available or occupied' });
  }

  try {
    const result = await pool.query(
      'UPDATE floor_tables SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update table error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/tables/:id
const deleteTable = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM floor_tables WHERE id = $1', [id]);
    res.json({ message: 'Table deleted' });
  } catch (err) {
    console.error('Delete table error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllTables, createTable, updateTableStatus, deleteTable };