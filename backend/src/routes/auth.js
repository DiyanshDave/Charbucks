const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { signup, login, googleCallback } = require('../controllers/authController');

// email/password routes
router.post('/signup', signup);
router.post('/login', login);

// google oauth — step 1: redirect to google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// google oauth — step 2: google redirects back here
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failed' }),
  googleCallback
);

router.get('/google/failed', (req, res) => {
  res.redirect('http://localhost:5173/login?error=google_auth_failed');
});

module.exports = router;