const express = require('express');
const router = express.Router();
const simpleScanController = require('../controllers/simpleScanController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Scan QR code
router.post('/scan', simpleScanController.scanQR);

// Get activity/transaction history
router.get('/activity', simpleScanController.getActivity);

// Get available rewards
router.get('/rewards', simpleScanController.getRewards);

// Redeem reward
router.post('/redeem/:rewardId', simpleScanController.redeemReward);

module.exports = router;