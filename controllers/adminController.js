// controllers/adminController.js

const User = require('../models/User');
const Kiosk = require('../models/Kiosk');
const Transaction = require('../models/Transaction');

// Utility function for coordinate validation
const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return { valid: false, error: 'Coordinates must be valid numbers' };
  }
  
  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  return { valid: true, latitude, longitude };
};

// --- User Management ---
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Build search query
    let query = { role: 'user' };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({ 
      success: true, 
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// --- Kiosk Management ---
exports.getAllKiosks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    // Status filter - handle both lowercase and uppercase
    if (status !== 'all') {
      query.status = status.toUpperCase();
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { kioskNumber: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const kiosks = await Kiosk.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalKiosks = await Kiosk.countDocuments(query);
    const totalPages = Math.ceil(totalKiosks / limit);

    res.status(200).json({ 
      success: true, 
      data: kiosks,
      pagination: {
        currentPage: page,
        totalPages,
        totalKiosks,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching kiosks:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getKioskById = async (req, res) => {
  try {
    const { id } = req.params;
    const kiosk = await Kiosk.findById(id);
    
    if (!kiosk) {
      return res.status(404).json({ success: false, error: 'Kiosk not found' });
    }
    
    res.status(200).json({ success: true, data: kiosk });
  } catch (err) {
    console.error('Error fetching kiosk:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createKiosk = async (req, res) => {
  try {
    const { 
      kioskNumber, 
      location, 
      coordinates, 
      description, 
      status, 
      capacity, 
      operatingHours 
    } = req.body;

    // Validate required fields
    if (!kioskNumber || !location) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kiosk number and location are required' 
      });
    }

    // Validate coordinates
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return res.status(400).json({ 
        success: false, 
        error: 'Coordinates (latitude and longitude) are required' 
      });
    }

    const coordValidation = validateCoordinates(coordinates.latitude, coordinates.longitude);
    if (!coordValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: coordValidation.error 
      });
    }

    // Check for duplicate kiosk number
    const existingKiosk = await Kiosk.findOne({ 
      kioskNumber: kioskNumber.toUpperCase() 
    });
    if (existingKiosk) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kiosk number already exists' 
      });
    }

    // Create kiosk data object
    const kioskData = {
      kioskNumber: kioskNumber.toUpperCase(),
      location,
      coordinates: {
        latitude: coordValidation.latitude,
        longitude: coordValidation.longitude
      }
    };

    // Add optional fields with proper case handling
    if (description) kioskData.description = description;
    if (status) kioskData.status = status.toUpperCase();
    if (capacity) {
      kioskData.capacity = {
        current: parseInt(capacity.current) || 0,
        max: parseInt(capacity.max) || 100
      };
    }
    if (operatingHours) {
      kioskData.operatingHours = operatingHours;
    }

    const newKiosk = new Kiosk(kioskData);
    await newKiosk.save();
    
    res.status(201).json({ success: true, data: newKiosk });
  } catch (err) {
    console.error('Error creating kiosk:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false, 
        error: errors.join(', ') 
      });
    }
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kiosk number already exists' 
      });
    }
    
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateKiosk = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Validate coordinates if provided
    if (updateData.coordinates) {
      const { latitude, longitude } = updateData.coordinates;
      const coordValidation = validateCoordinates(latitude, longitude);
      if (!coordValidation.valid) {
        return res.status(400).json({ 
          success: false, 
          error: coordValidation.error 
        });
      }
      updateData.coordinates = {
        latitude: coordValidation.latitude,
        longitude: coordValidation.longitude
      };
    }

    // Normalize kiosk number if provided
    if (updateData.kioskNumber) {
      updateData.kioskNumber = updateData.kioskNumber.toUpperCase();
      
      // Check for duplicate kiosk number (excluding current kiosk)
      const existingKiosk = await Kiosk.findOne({ 
        kioskNumber: updateData.kioskNumber,
        _id: { $ne: id }
      });
      if (existingKiosk) {
        return res.status(400).json({ 
          success: false, 
          error: 'Kiosk number already exists' 
        });
      }
    }

    // Normalize status if provided
    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
    }

    const updatedKiosk = await Kiosk.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedKiosk) {
      return res.status(404).json({ success: false, error: 'Kiosk not found' });
    }
    
    res.status(200).json({ success: true, data: updatedKiosk });
  } catch (err) {
    console.error('Error updating kiosk:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false, 
        error: errors.join(', ') 
      });
    }
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kiosk number already exists' 
      });
    }
    
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateKioskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status is required' 
      });
    }

    const validStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];
    const normalizedStatus = status.toUpperCase();
    
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }

    const updatedKiosk = await Kiosk.findByIdAndUpdate(
      id, 
      { status: normalizedStatus }, 
      { new: true, runValidators: true }
    );
    
    if (!updatedKiosk) {
      return res.status(404).json({ success: false, error: 'Kiosk not found' });
    }
    
    res.status(200).json({ success: true, data: updatedKiosk });
  } catch (err) {
    console.error('Error updating kiosk status:', err);
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
    
    res.status(200).json({ 
      success: true, 
      message: `Kiosk ${deletedKiosk.kioskNumber} deleted successfully` 
    });
  } catch (err) {
    console.error('Error deleting kiosk:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getNearbyKiosks = async (req, res) => {
  try {
    const { lat, lng, radius = 10, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        error: 'Latitude and longitude are required' 
      });
    }

    const coordValidation = validateCoordinates(lat, lng);
    if (!coordValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: coordValidation.error 
      });
    }

    const maxDistance = parseFloat(radius) * 1000; // Convert km to meters
    const limitNum = parseInt(limit) || 20;

    const nearbyKiosks = await Kiosk.findNearby(
      coordValidation.latitude, 
      coordValidation.longitude, 
      maxDistance, 
      limitNum
    );

    // Add distance to each kiosk
    const kioskWithDistance = nearbyKiosks.map(kiosk => ({
      ...kiosk.toObject(),
      distance: kiosk.distanceTo(coordValidation.latitude, coordValidation.longitude)
    }));

    res.status(200).json({ 
      success: true, 
      data: kioskWithDistance,
      searchCenter: {
        latitude: coordValidation.latitude,
        longitude: coordValidation.longitude
      },
      searchRadius: radius
    });
  } catch (err) {
    console.error('Error finding nearby kiosks:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// --- E-Waste Management ---
exports.getAllEwaste = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const category = req.query.category || 'all';
    const skip = (page - 1) * limit;

    // Build query
    let query = { type: 'scan' };
    
    // Category filter
    if (category !== 'all') {
      query.category = { $regex: category, $options: 'i' };
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { category: { $regex: search, $options: 'i' } },
        { 'userId.fullName': { $regex: search, $options: 'i' } },
        { 'userId.username': { $regex: search, $options: 'i' } }
      ];
    }

    // Populate user info along with the transaction
    const ewasteTransactions = await Transaction.find(query)
      .populate('userId', 'fullName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTransactions = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalTransactions / limit);
      
    res.status(200).json({ 
      success: true, 
      data: ewasteTransactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching e-waste:', err);
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
    
    // Get total count
    const totalCount = summary.reduce((acc, item) => acc + item.count, 0);
    
    // Add percentage to each category
    const summaryWithPercentage = summary.map(item => ({
      category: item._id,
      count: item.count,
      percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
    }));
    
    res.status(200).json({ 
      success: true, 
      data: summaryWithPercentage,
      totalCount
    });
  } catch (err) {
    console.error('Error fetching e-waste summary:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};