const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

exports.scanQR = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ error: 'QR data is required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    let decoded;
    try {
      decoded = JSON.parse(qrData);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid QR data format' });
    }

    const incentive = Number(decoded.incentiveVal) || 0;

    const transaction = new Transaction({
      transactionId: uuidv4(),
      userId: req.user._id,
      scannedObject: decoded.scannedObject || 'Unknown Object',
      category: decoded.category || 'General',
      locationTag: decoded.locationTag || '',
      locationCode: decoded.locationCode || '',
      vendoMachineCode: decoded.vendoMachineCode || '',
      itemCateg: decoded.itemCateg || '',
      itemStatus: decoded.itemStatus || '',
      itemVal: decoded.itemVal || 0,
      incentiveVal: incentive,
      phpValue: decoded.phpValue || 0,
      scannedDate: new Date(),
      status: 'Completed',
      type: 'scan',
      points: incentive // updated to incenfitve
    });

    await transaction.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: incentive }
    });

    return res.status(200).json({
      success: true,
      message: 'QR scanned and data saved successfully',
      data: transaction
    });
  } catch (err) {
    console.error('Scan error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const history = await Transaction.find({
      userId: req.user._id,
      type: 'scan'
    }).sort({ scannedDate: -1 });

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};