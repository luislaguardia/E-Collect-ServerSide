const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/generate', authMiddleware, qrController.generateQR); // should remove middleware when generating kasi tinatamad ako gumawa admin roles
router.post('/scan', authMiddleware, qrController.scanQR);
router.get('/my-transactions', authMiddleware, qrController.getMyTransactions);
router.get('/my-stats', authMiddleware, qrController.getMyStats);

// public route
router.get('/status/:id', qrController.getQRStatus);

module.exports = router;