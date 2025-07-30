const express = require('express');
const router = express.Router();
const simpleScanController = require('../controllers/simpleScanController');
const { authMiddleware } = require('../middleware/authMiddleware');

// if want, put back the middleware "authMiddleware"

router.post('/scan', simpleScanController.scanQR);

// router.get('/activity', simpleScanController.getActivity);
// router.get('/rewards', simpleScanController.getRewards);
// router.post('/redeem/:rewardId', simpleScanController.redeemReward);

module.exports = router;