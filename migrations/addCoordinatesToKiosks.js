// migrations/addCoordinatesToKiosks.js
// Run this script to add default coordinates to existing kiosks

const mongoose = require('mongoose');
const Kiosk = require('../models/Kiosk'); // Adjust path as needed

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for migration');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Default coordinates for Manila, Philippines
const DEFAULT_COORDINATES = {
  latitude: 14.5995,
  longitude: 120.9842
};

const migrateKiosks = async () => {
  try {
    console.log('🔄 Starting kiosk migration...');
    
    // Find all kiosks without coordinates
    const kioskWithoutCoords = await Kiosk.find({
      $or: [
        { coordinates: { $exists: false } },
        { 'coordinates.latitude': { $exists: false } },
        { 'coordinates.longitude': { $exists: false } }
      ]
    });

    console.log(`📊 Found ${kioskWithoutCoords.length} kiosks without coordinates`);

    if (kioskWithoutCoords.length === 0) {
      console.log('✅ All kiosks already have coordinates');
      return;
    }

    // Update kiosks with default coordinates
    const updatePromises = kioskWithoutCoords.map(async (kiosk, index) => {
      // Add slight variation to avoid all kiosks at same location
      const variation = 0.001; // ~100m variation
      const latOffset = (Math.random() - 0.5) * variation;
      const lngOffset = (Math.random() - 0.5) * variation;

      const coordinates = {
        latitude: DEFAULT_COORDINATES.latitude + latOffset,
        longitude: DEFAULT_COORDINATES.longitude + lngOffset
      };

      await Kiosk.findByIdAndUpdate(kiosk._id, {
        coordinates,
        // Add default values for new fields if they don't exist
        ...(kiosk.status === undefined && { status: 'ACTIVE' }),
        ...(kiosk.situation === undefined && { situation: 'AVAILABLE' }),
        ...(kiosk.capacity === undefined && { 
          capacity: { current: 0, max: 100 } 
        }),
        ...(kiosk.operatingHours === undefined && { 
          operatingHours: { open: '06:00', close: '22:00' } 
        })
      });

      console.log(`✅ Updated kiosk ${kiosk.kioskNumber} - ${kiosk.location}`);
    });

    await Promise.all(updatePromises);
    
    console.log('🎉 Migration completed successfully!');
    
    // Verify the migration
    const allKiosks = await Kiosk.find({});
    const kioskWithCoords = allKiosks.filter(k => 
      k.coordinates && 
      k.coordinates.latitude && 
      k.coordinates.longitude
    );
    
    console.log(`📈 Migration summary:`);
    console.log(`   - Total kiosks: ${allKiosks.length}`);
    console.log(`   - Kiosks with coordinates: ${kioskWithCoords.length}`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
};

// Run the migration
const runMigration = async () => {
  await connectDB();
  await migrateKiosks();
  await mongoose.connection.close();
  console.log('🔒 Database connection closed');
  process.exit(0);
};

// Execute if run directly
if (require.main === module) {
  runMigration();
}

module.exports = { migrateKiosks };