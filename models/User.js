const mongoose = require('mongoose');

// Transaction schema for QR code scans
const transactionSchema = new mongoose.Schema({
  qrCodeId: {
    type: String,
    required: true
  },
  phpValue: {
    type: String,
    required: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  },
  qrCreatedAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'duplicate'],
    default: 'success'
  },

  // Anew addeddddd
points: {
  type: Number,
  default: 0
},
  // Optional: Store additional scan details
  scanDetails: {
    userAgent: String,
    ipAddress: String,
    location: String
  }
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // QR code transaction history
  transactions: [transactionSchema],
  
  // Optional: Quick stats
  transactionStats: {
    totalScanned: { type: Number, default: 0 },
    lastScanDate: { type: Date, default: null }
  }
  
}, { timestamps: true });

// Method to add transaction to user's history
userSchema.methods.addTransaction = function(qrData, scanDetails = {}) {
  const transaction = {
    qrCodeId: qrData.id,
    phpValue: qrData.phpValue,
    scannedAt: new Date(),
    qrCreatedAt: new Date(qrData.date),
    status: 'success',
    scanDetails: scanDetails
  };
  
  this.transactions.push(transaction);
  
  // Update stats
  this.transactionStats.totalScanned += 1;
  this.transactionStats.lastScanDate = new Date();
  
  return this.save();
};

// Method to get user's transaction history with pagination
userSchema.methods.getTransactionHistory = function(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const transactions = this.transactions
    .sort({ scannedAt: -1 })
    .slice(skip, skip + limit);
  
  return {
    transactions: transactions,
    total: this.transactions.length,
    page: page,
    limit: limit,
    pages: Math.ceil(this.transactions.length / limit)
  };
};

// Method to get transaction stats
userSchema.methods.getTransactionStats = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const todayScans = this.transactions.filter(t => t.scannedAt >= today).length;
  const weekScans = this.transactions.filter(t => t.scannedAt >= thisWeek).length;
  const monthScans = this.transactions.filter(t => t.scannedAt >= thisMonth).length;
  
  return {
    total: this.transactionStats.totalScanned,
    today: todayScans,
    thisWeek: weekScans,
    thisMonth: monthScans,
    lastScanDate: this.transactionStats.lastScanDate
  };
};

module.exports = mongoose.model('User', userSchema);