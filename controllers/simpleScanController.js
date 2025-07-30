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

    // Extract from scanned QR payload
    const scannedObject = decoded.object || 'Unknown Object';
    const category = decoded.category || 'General';
    const locationTag = decoded.location || '';
    const locationCode = decoded.location_code || '';
    const vendoMachineCode = decoded.machine_code || '';
    const itemCateg = decoded.item_category || '';
    const itemStatus = decoded.item_status || '';
    const itemVal = decoded.item_value || 'Unknown';
    const phpValue = decoded.php_value || 'Unknown';
    const incentiveVal = decoded.incentive || 0;

    const numericPoints = parseFloat(incentiveVal) || 0;

    const transaction = new Transaction({
      transactionId: uuidv4(),
      userId: req.user._id,
      scannedObject,
      category,
      locationTag,
      locationCode,
      vendoMachineCode,
      itemCateg,
      itemStatus,
      itemVal,
      incentiveVal,
      phpValue,
      scannedDate: new Date(),
      status: 'Completed',
      type: 'scan',
      points: numericPoints
    });

    await transaction.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: numericPoints }
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