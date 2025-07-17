const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phpValue: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  scannedDate: {
    type: Date,
    default: null
  },
  isUsed: {
    type: Boolean,
    default: false,
    index: true
  },
  qrData: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QRCode', qrCodeSchema);