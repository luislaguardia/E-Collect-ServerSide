const express = require('express');
const router = express.Router();
const simpleScanController = require('../controllers/simpleScanController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Scan QR code
router.post('/scan', authMiddleware, simpleScanController.scanQR);

// Get activity/transaction history
router.get('/activity', authMiddleware, simpleScanController.getActivity);

// Get available rewards
router.get('/rewards', authMiddleware, simpleScanController.getRewards);

// Redeem reward
router.post('/redeem/:rewardId', authMiddleware, simpleScanController.redeemReward);

module.exports = router;