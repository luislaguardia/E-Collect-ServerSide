const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const qrRoutes = require('./routes/qrRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// ===================================
app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
// ===================================

// mema lang from YT
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
}).catch(err => {
  console.error('Connection error:', err);
});

module.exports = app;