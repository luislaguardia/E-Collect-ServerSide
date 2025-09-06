// controllers/dashboardController.js

const User = require('../models/User');
const Kiosk = require('../models/Kiosk');
const Transaction = require('../models/Transaction');

exports.getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: 'user' });
    const kioskCount = await Kiosk.countDocuments();
    const ewasteCount = await Transaction.countDocuments({ type: 'scan' });

    // Find the first kiosk that is full
    const fullKiosk = await Kiosk.findOne({ situation: 'FULL' });

    res.status(200).json({
      success: true,
      data: {
        users: userCount,
        kiosks: kioskCount,
        ewaste: ewasteCount,
        kioskStatus: fullKiosk ? 'FULL' : 'AVAILABLE' // Simplified status for the dashboard
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};