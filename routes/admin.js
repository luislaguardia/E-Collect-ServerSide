// routes/admin.js

const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Import controllers
const dashboardController = require('../controllers/dashboardController');
const adminController = require('../controllers/adminController');

// --- Public Kiosk Routes (No Authentication Required) ---
// These routes are accessible without authentication for public kiosk information
router.get('/kiosks', adminController.getAllKiosks);
router.get('/kiosks/nearby', adminController.getNearbyKiosks);

// Apply middleware to all routes below this line
router.use(authMiddleware);
router.use(adminMiddleware);

// --- Dashboard Routes ---
router.get('/stats', dashboardController.getStats);

// --- User Management Routes ---
router.get('/users', adminController.getAllUsers);

// --- Protected Kiosk Management Routes ---
router.get('/kiosks/:id', adminController.getKioskById);
router.post('/kiosks', adminController.createKiosk);
router.put('/kiosks/:id', adminController.updateKiosk);
router.patch('/kiosks/:id/status', adminController.updateKioskStatus);
router.delete('/kiosks/:id', adminController.deleteKiosk);

// --- E-Waste Management Routes ---
router.get('/ewaste', adminController.getAllEwaste);
router.get('/ewaste-summary', adminController.getEwasteSummary);

// --- Health Check Route ---
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin API is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;