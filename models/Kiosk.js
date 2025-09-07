// models/Kiosk.js

const mongoose = require('mongoose');

const kioskSchema = new mongoose.Schema({
  kioskNumber: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  },
  // Coordinates for map integration
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  // Optional description
  description: {
    type: String,
    trim: true
  },
  // e.g., "FULL", "AVAILABLE", "MAINTENANCE"
  situation: {
    type: String,
    enum: ['FULL', 'AVAILABLE', 'MAINTENANCE'],
    default: 'AVAILABLE'
  },
  // e.g., "ACTIVE", "INACTIVE", "MAINTENANCE"
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
    default: 'ACTIVE'
  },
  // Capacity information
  capacity: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    max: {
      type: Number,
      default: 100,
      min: 1
    }
  },
  // Operating hours
  operatingHours: {
    open: {
      type: String,
      default: '06:00',
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    close: {
      type: String,
      default: '22:00',
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  }
}, { 
  timestamps: true,
  // Add index for geospatial queries
  index: { coordinates: '2dsphere' }
});

// Add virtual for capacity percentage
kioskSchema.virtual('capacityPercentage').get(function() {
  if (!this.capacity || !this.capacity.max || this.capacity.max === 0) {
    return 0;
  }
  return Math.round((this.capacity.current / this.capacity.max) * 100);
});

// Ensure virtual fields are included in JSON output
kioskSchema.set('toJSON', { virtuals: true });
kioskSchema.set('toObject', { virtuals: true });

// Pre-save middleware for validation
kioskSchema.pre('save', function(next) {
  // Validate capacity
  if (this.capacity.current > this.capacity.max) {
    next(new Error('Current capacity cannot exceed maximum capacity'));
    return;
  }
  
  // Normalize kiosk number to uppercase
  if (this.kioskNumber) {
    this.kioskNumber = this.kioskNumber.toUpperCase();
  }
  
  next();
});

// Static method to find nearby kiosks
kioskSchema.statics.findNearby = function(lat, lng, maxDistance = 10000, limit = 20) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat] // Note: MongoDB expects [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    }
  }).limit(limit);
};

// Instance method to calculate distance to a point
kioskSchema.methods.distanceTo = function(lat, lng) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat - this.coordinates.latitude) * Math.PI / 180;
  const dLng = (lng - this.coordinates.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.coordinates.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

module.exports = mongoose.model('Kiosk', kioskSchema);