// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  points: {
    type: Number,
    default: 0
  }


}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);