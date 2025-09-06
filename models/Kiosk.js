// models/Kiosk.js

const mongoose = require('mongoose');

const kioskSchema = new mongoose.Schema({
  kioskNumber: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  },
  // e.g., "FULL", "AVAILABLE", "MAINTENANCE"
  situation: {
    type: String,
    enum: ['FULL', 'AVAILABLE', 'MAINTENANCE'],
    default: 'AVAILABLE'
  },
  // e.g., "ACTIVE", "INACTIVE"
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

module.exports = mongoose.model('Kiosk', kioskSchema);