const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/simpleScanRoutes');
const adminRoutes = require('./routes/admin'); // new

const app = express();
app.use(cors());
app.use(express.json());

// ===================================
app.use('/api/auth', authRoutes);
app.use('/api', scanRoutes);
// ===================================
app.use('/api/admin', adminRoutes); // new

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('Connection error:', err);
  });

module.exports = app;

// notes
// new added;
// simpleScanController, Transaction, simpleScanRoutes
// im not using the qrController shits now...
