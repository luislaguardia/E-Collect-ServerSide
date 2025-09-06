// controllers/adminController.js

const User = require('../models/User');
const Kiosk = require('../models/Kiosk');
const Transaction = require('../models/Transaction');

// --- User Management ---
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// --- Kiosk Management ---
exports.getAllKiosks = async (req, res) => {
  try {
    const kiosks = await Kiosk.find();
    res.status(200).json({ success: true, data: kiosks });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createKiosk = async (req, res) => {
  try {
    const { kioskNumber, location } = req.body;
    const newKiosk = new Kiosk({ kioskNumber, location });
    await newKiosk.save();
    res.status(201).json({ success: true, data: newKiosk });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateKiosk = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedKiosk = await Kiosk.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedKiosk) {
      return res.status(404).json({ success: false, error: 'Kiosk not found' });
    }
    res.status(200).json({ success: true, data: updatedKiosk });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteKiosk = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedKiosk = await Kiosk.findByIdAndDelete(id);
    if (!deletedKiosk) {
      return res.status(404).json({ success: false, error: 'Kiosk not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// --- E-Waste Management ---
exports.getAllEwaste = async (req, res) => {
  try {
    // Populate user info along with the transaction
    const ewasteTransactions = await Transaction.find({ type: 'scan' })
      .populate('userId', 'fullName username')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, data: ewasteTransactions });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getEwasteSummary = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      { $match: { type: 'scan' } }, // Match only e-waste scans
      { $group: { _id: '$category', count: { $sum: 1 } } }, // Group by category and count
      { $sort: { count: -1 } } // Sort by the most common categories
    ]);
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
