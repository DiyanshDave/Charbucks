const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../db/pool');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const name = profile.displayName;

          // check if user already exists
          const existing = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
          );

          if (existing.rows.length > 0) {
            return done(null, existing.rows[0]);
          }

          // new user — insert into DB
          const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, 'GOOGLE_AUTH']
          );

          return done(null, result.rows[0]);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
  console.log('Google OAuth: Configured');
} else {
  console.log('Google OAuth: Skipped (no credentials in .env)');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;