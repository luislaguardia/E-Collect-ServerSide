// routes/admin.js

const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Import controllers
const dashboardController = require('../controllers/dashboardController');
const adminController = require('../controllers/adminController');

// --- Kiosk Management Routes (No Middleware) ---
router.get('/kiosks', adminController.getAllKiosks);

// Apply middleware to all routes below this line
router.use(authMiddleware);
router.use(adminMiddleware);

// --- Dashboard Routes ---
router.get('/stats', dashboardController.getStats);

// --- User Management Routes ---
router.get('/users', adminController.getAllUsers);

// --- Kiosk Management Routes ---
router.post('/kiosks', adminController.createKiosk);
router.put('/kiosks/:id', adminController.updateKiosk);
router.delete('/kiosks/:id', adminController.deleteKiosk);

// --- E-Waste Management Routes ---
router.get('/ewaste', adminController.getAllEwaste);
router.get('/ewaste-summary', adminController.getEwasteSummary);

module.exports = router;