// const Transaction = require('../models/Transaction');
// const User = require('../models/User');
// const { v4: uuidv4 } = require('uuid');

// class SimpleScanController {
//   // Scan QR and add to activity/transaction history
//   async scanQR(req, res) {
//     try {
//       const { qrData } = req.body;
      
//       if (!qrData) {
//         return res.status(400).json({ 
//           success: false,
//           error: 'QR data is required' 
//         });
//       }

//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           error: 'Authentication required'
//         });
//       }

//       let parsedData;
//       try {
//         parsedData = JSON.parse(qrData);
//       } catch (parseError) {
//         return res.status(400).json({ 
//           success: false,
//           error: 'Invalid QR code format' 
//         });
//       }

//       const transactionId = uuidv4();
//       const currentDate = new Date();

//       // Create transaction record for activity
//       const transaction = new Transaction({
//         transactionId: transactionId,
//         userId: req.user._id,
//         scannedObject: parsedData.scannedObject || parsedData['Scanned Object'] || 'Unknown Item',
//         category: parsedData.category || parsedData.Category || 'Other Electronics',
//         locationTag: parsedData.locationTag || 'Visayas Avenue, Quezon City',
//         locationCode: parsedData.locationCode || '002QC',
//         vendoMachineCode: parsedData.vendoMachineCode || 'Vendo001',
//         itemCateg: parsedData.itemCateg || parsedData.Category || 'Other Electronics',
//         itemStatus: parsedData.itemStatus || 'Placeholder',
//         itemVal: parsedData.itemVal || 'Search online for market value',
//         incentiveVal: parsedData.incentiveVal || 'Calculated incentive',
//         phpValue: parsedData.phpValue || 'Search online for market value',
//         scannedDate: currentDate,
//         status: 'Completed', // Immediately mark as completed for simplicity
//         points: this.calculatePoints(parsedData), // Calculate points based on item
//         type: 'scan'
//       });

//       await transaction.save();

//       // Update user points
//       const pointsEarned = this.calculatePoints(parsedData);
//       await User.findByIdAndUpdate(req.user._id, {
//         $inc: { points: pointsEarned }
//       });

//       res.json({
//         success: true,
//         data: {
//           transactionId: transactionId,
//           scannedObject: transaction.scannedObject,
//           category: transaction.category,
//           pointsEarned: pointsEarned,
//           scannedDate: currentDate,
//           status: 'Completed'
//         },
//         message: `Successfully scanned ${transaction.scannedObject}! You earned ${pointsEarned} points.`
//       });

//     } catch (error) {
//       console.error('Error scanning QR:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to scan QR code'
//       });
//     }
//   }

//   // Get activity/transaction history
//   async getActivity(req, res) {
//     try {
//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           error: 'Authentication required'
//         });
//       }

//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 20;

//       const total = await Transaction.countDocuments({ userId: req.user._id });
//       const transactions = await Transaction.find({ userId: req.user._id })
//         .sort({ scannedDate: -1 })
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .lean();

//       const pages = Math.ceil(total / limit);

//       res.json({
//         success: true,
//         data: transactions,
//         pagination: {
//           page: page,
//           limit: limit,
//           total: total,
//           pages: pages
//         }
//       });

//     } catch (error) {
//       console.error('Error getting activity:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to get activity'
//       });
//     }
//   }

//   // Get available rewards (based on user points)
//   async getRewards(req, res) {
//     try {
//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           error: 'Authentication required'
//         });
//       }

//       // Get user's current points
//       const user = await User.findById(req.user._id).select('points');
//       const userPoints = user.points || 0;

//       // Define available rewards
//       const availableRewards = [
//         {
//           id: 1,
//           name: '₱10 Cash Reward',
//           description: 'Redeem for ₱10 cash',
//           pointsRequired: 100,
//           category: 'cash',
//           image: '/assets/cash-reward.png',
//           canRedeem: userPoints >= 100
//         },
//         {
//           id: 2,
//           name: '₱25 Cash Reward',
//           description: 'Redeem for ₱25 cash',
//           pointsRequired: 250,
//           category: 'cash',
//           image: '/assets/cash-reward.png',
//           canRedeem: userPoints >= 250
//         },
//         {
//           id: 3,
//           name: '₱50 Cash Reward',
//           description: 'Redeem for ₱50 cash',
//           pointsRequired: 500,
//           category: 'cash',
//           image: '/assets/cash-reward.png',
//           canRedeem: userPoints >= 500
//         },
//         {
//           id: 4,
//           name: '₱100 Cash Reward',
//           description: 'Redeem for ₱100 cash',
//           pointsRequired: 1000,
//           category: 'cash',
//           image: '/assets/cash-reward.png',
//           canRedeem: userPoints >= 1000
//         },
//         {
//           id: 5,
//           name: 'GCash ₱20',
//           description: 'GCash transfer of ₱20',
//           pointsRequired: 200,
//           category: 'gcash',
//           image: '/assets/gcash-reward.png',
//           canRedeem: userPoints >= 200
//         },
//         {
//           id: 6,
//           name: 'GCash ₱50',
//           description: 'GCash transfer of ₱50',
//           pointsRequired: 500,
//           category: 'gcash',
//           image: '/assets/gcash-reward.png',
//           canRedeem: userPoints >= 500
//         }
//       ];

//       res.json({
//         success: true,
//         data: {
//           userPoints: userPoints,
//           rewards: availableRewards
//         }
//       });

//     } catch (error) {
//       console.error('Error getting rewards:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to get rewards'
//       });
//     }
//   }

//   // Redeem reward
//   async redeemReward(req, res) {
//     try {
//       const { rewardId } = req.params;
//       const { redemptionMethod = 'Cash' } = req.body;

//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           error: 'Authentication required'
//         });
//       }

//       const user = await User.findById(req.user._id);
//       const userPoints = user.points || 0;

//       // Define rewards (same as above - you might want to store this in database)
//       const rewards = {
//         1: { name: '₱10 Cash Reward', points: 100, value: 10 },
//         2: { name: '₱25 Cash Reward', points: 250, value: 25 },
//         3: { name: '₱50 Cash Reward', points: 500, value: 50 },
//         4: { name: '₱100 Cash Reward', points: 1000, value: 100 },
//         5: { name: 'GCash ₱20', points: 200, value: 20 },
//         6: { name: 'GCash ₱50', points: 500, value: 50 }
//       };

//       const selectedReward = rewards[rewardId];
      
//       if (!selectedReward) {
//         return res.status(404).json({
//           success: false,
//           error: 'Reward not found'
//         });
//       }

//       if (userPoints < selectedReward.points) {
//         return res.status(400).json({
//           success: false,
//           error: 'Insufficient points',
//           required: selectedReward.points,
//           current: userPoints
//         });
//       }

//       // Deduct points and create redemption record
//       await User.findByIdAndUpdate(req.user._id, {
//         $inc: { points: -selectedReward.points }
//       });

//       // Create redemption transaction
//       const redemptionTransaction = new Transaction({
//         transactionId: uuidv4(),
//         userId: req.user._id,
//         scannedObject: selectedReward.name,
//         category: 'Redemption',
//         points: -selectedReward.points, // Negative points for redemption
//         scannedDate: new Date(),
//         status: 'Redeemed',
//         type: 'redemption',
//         redemptionMethod: redemptionMethod,
//         redemptionValue: selectedReward.value
//       });

//       await redemptionTransaction.save();

//       res.json({
//         success: true,
//         data: {
//           rewardName: selectedReward.name,
//           pointsUsed: selectedReward.points,
//           remainingPoints: userPoints - selectedReward.points,
//           redemptionValue: selectedReward.value,
//           redemptionMethod: redemptionMethod
//         },
//         message: `Successfully redeemed ${selectedReward.name}!`
//       });

//     } catch (error) {
//       console.error('Error redeeming reward:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Failed to redeem reward'
//       });
//     }
//   }

//   // Helper function to calculate points based on scanned item
//   calculatePoints(data) {
//     // Simple point calculation - you can make this more sophisticated
//     const category = data.category || data.Category || 'Other Electronics';
    
//     switch (category.toLowerCase()) {
//       case 'motherboards(pc)':
//       case 'processors(cpu)':
//         return 50; // High-value electronics
//       case 'other electronics':
//         return 30; // Medium-value electronics
//       case 'cables':
//       case 'accessories':
//         return 20; // Low-value items
//       default:
//         return 25; // Default points
//     }
//   }
// }

// module.exports = new SimpleScanController();


// ==================================================================== 
// new version

const Transaction = require('../models/Transaction');

exports.scanQR = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ error: 'QR data is required' });
    }

    // Parse QR content into object
    const decoded = JSON.parse(qrData); // assuming qrData is already a stringified JSON

    // Insert raw QR payload into the DB
    const newTransaction = new Transaction({
      ...decoded, // directly saving parsed values
      scannedDate: new Date(),
      status: 'Completed'
    });

    await newTransaction.save();

    res.status(200).json({
      success: true,
      message: 'QR scanned and data saved successfully',
      data: newTransaction
    });

  } catch (err) {
    console.error('Scan error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};