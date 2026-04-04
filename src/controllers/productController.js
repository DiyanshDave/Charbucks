const pool = require('../db/pool');

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/products  (admin adds a product)
const createProduct = async (req, res) => {
  const { id, name, price, category } = req.body;

  if (!id || !name || !price || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (id, name, price, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, price, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllProducts, createProduct, deleteProduct };