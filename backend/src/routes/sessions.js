const express = require('express');
const router = express.Router();
const {
  openSession,
  closeSession,
  getAllSessions,
} = require('../controllers/sessionController');

router.post('/open', openSession);
router.post('/close', closeSession);
router.get('/', getAllSessions);

module.exports = router;