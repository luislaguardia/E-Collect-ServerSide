// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // ADD THIS: Role for access control
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // ADD THIS: Central points tracking
  points: {
    type: Number,
    default: 0
  }
  
  // NOTE: The rest of the old transaction-related code in this file can be
  // removed since you are using the separate 'Transaction.js' model.

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);