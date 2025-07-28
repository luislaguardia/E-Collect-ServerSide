const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Item details
  scannedObject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  locationTag: {
    type: String,
    default: 'Visayas Avenue, Quezon City'
  },
  locationCode: {
    type: String,
    default: '002QC'
  },
  vendoMachineCode: {
    type: String,
    default: 'Vendo001'
  },
  itemCateg: {
    type: String
  },
  itemStatus: {
    type: String
  },
  itemVal: {
    type: String
  },
  incentiveVal: {
    type: String
  },
  phpValue: {
    type: String
  },
  // Transaction details
  scannedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Completed', 'Redeemed'],
    default: 'Completed'
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  type: {
    type: String,
    enum: ['scan', 'redemption'],
    required: true
  },
  // For redemptions
  redemptionMethod: {
    type: String,
    enum: ['Cash', 'GCash', 'Bank Transfer'],
    default: null
  },
  redemptionValue: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ userId: 1, scannedDate: -1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);