const express = require('express');
const router = express.Router();
const {
  getAllTables,
  createTable,
  updateTableStatus,
  deleteTable,
} = require('../controllers/tableController');

router.get('/', getAllTables);
router.post('/', createTable);
router.patch('/:id', updateTableStatus);
router.delete('/:id', deleteTable);

module.exports = router;