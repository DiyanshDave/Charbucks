const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const { signup, login } = require('../controllers/authController');

// existing routes
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
  (req, res) => {
    // generate JWT for the google user
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // send token back to frontend
    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  }
);

router.get('/google/failed', (req, res) => {
  res.status(401).json({ error: 'Google authentication failed' });
});

module.exports = router;