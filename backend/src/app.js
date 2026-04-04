const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const tableRoutes = require('./routes/tables');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const sessionRoutes = require('./routes/sessions');
const reportRoutes = require('./routes/reports');
const kitchenRoutes = require('./routes/kitchen');
const app = express();

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/kitchen', kitchenRoutes);

app.get('/', (req, res) => res.json({ message: 'Charbucks API running' }));

module.exports = app;