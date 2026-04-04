const express = require('express');
const router = express.Router();
const { getReports, getDashboard } = require('../controllers/reportController');

router.get('/', getReports);
router.get('/dashboard', getDashboard);

module.exports = router;