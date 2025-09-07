// test-migration.js
// Simple test to check database connection and kiosk model

require('dotenv').config();
const mongoose = require('mongoose');

// Simple kiosk schema (adjust path if needed)
const kioskSchema = new mongoose.Schema({
  kioskNumber: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 }
  },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], default: 'ACTIVE' },
  situation: { type: String, enum: ['FULL', 'AVAILABLE', 'MAINTENANCE'], default: 'AVAILABLE' }
}, { timestamps: true });

const Kiosk = mongoose.model('Kiosk', kioskSchema);

const testMigration = async () => {
  try {
    console.log('🔗 Connecting to database...');
    console.log('URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check existing kiosks
    const allKiosks = await Kiosk.find({});
    console.log(`📊 Found ${allKiosks.length} existing kiosks`);

    if (allKiosks.length === 0) {
      console.log('ℹ️  No existing kiosks found. Creating a test kiosk...');
      
      const testKiosk = new Kiosk({
        kioskNumber: 'TEST001',
        location: 'Test Location - Manila',
        coordinates: {
          latitude: 14.5995,
          longitude: 120.9842
        },
        status: 'ACTIVE',
        situation: 'AVAILABLE'
      });

      await testKiosk.save();
      console.log('✅ Test kiosk created successfully');
    } else {
      console.log('📋 Existing kiosks:');
      allKiosks.forEach((kiosk, index) => {
        const hasCoords = kiosk.coordinates && kiosk.coordinates.latitude && kiosk.coordinates.longitude;
        console.log(`${index + 1}. ${kiosk.kioskNumber} - ${kiosk.location} - Coordinates: ${hasCoords ? 'YES' : 'NO'}`);
      });

      // Check if any need coordinates
      const needsCoords = allKiosks.filter(k => !k.coordinates || !k.coordinates.latitude || !k.coordinates.longitude);
      
      if (needsCoords.length > 0) {
        console.log(`\n🔄 ${needsCoords.length} kiosks need coordinates. Adding them...`);
        
        for (let kiosk of needsCoords) {
          const variation = 0.001;
          const latOffset = (Math.random() - 0.5) * variation;
          const lngOffset = (Math.random() - 0.5) * variation;

          await Kiosk.findByIdAndUpdate(kiosk._id, {
            coordinates: {
              latitude: 14.5995 + latOffset,
              longitude: 120.9842 + lngOffset
            }
          });
          console.log(`✅ Added coordinates to ${kiosk.kioskNumber}`);
        }
        console.log('🎉 All kiosks now have coordinates!');
      } else {
        console.log('✅ All kiosks already have coordinates');
      }
    }

    // Final verification
    const updatedKiosks = await Kiosk.find({});
    const withCoords = updatedKiosks.filter(k => k.coordinates && k.coordinates.latitude && k.coordinates.longitude);
    console.log(`\n📈 Final count: ${withCoords.length}/${updatedKiosks.length} kiosks have coordinates`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
};

testMigration();