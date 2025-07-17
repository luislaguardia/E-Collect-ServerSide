const QRCode = require('../models/QRCode');
const User = require('../models/User');
const QRCodeGenerator = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class QRController {
  async generateQR(req, res) {
    try {
      const { phpValue } = req.body;
      
      if (!phpValue) {
        return res.status(400).json({ 
          success: false,
          error: 'PHP value is required' 
        });
      }
      
      const uniqueId = uuidv4();
      const currentDate = new Date();
      
      const qrData = {
        id: uniqueId,
        phpValue: phpValue,
        date: currentDate.toISOString(),
        timestamp: currentDate.getTime()
      };
      
      const qrDataString = JSON.stringify(qrData);
      const hash = crypto.createHash('sha256').update(qrDataString).digest('hex');
      
      const qrCode = new QRCode({
        id: uniqueId,
        phpValue: phpValue,
        createdDate: currentDate,
        qrData: qrDataString,
        hash: hash,
        createdBy: req.user ? req.user._id : null
      });
      
      await qrCode.save();
      
      const qrCodeDataURL = await QRCodeGenerator.toDataURL(qrDataString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      res.json({
        success: true,
        qrCode: qrCodeDataURL,
        data: qrData,
        message: 'QR code generated successfully'
      });
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({ 
          success: false,
          error: 'QR code already exists' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Failed to generate QR code' 
      });
    }
  }

  // uupdated scan QR code then add to users transaction history
  async scanQR(req, res) {
    try {
      const { qrData } = req.body;
      
      if (!qrData) {
        return res.status(400).json({ 
          success: false,
          error: 'QR data is required' 
        });
      }
      
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch (parseError) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid QR code format' 
        });
      }
      
      const hash = crypto.createHash('sha256').update(qrData).digest('hex');
      
      const qrRecord = await QRCode.findOne({ hash: hash });
      
      if (!qrRecord) {
        return res.status(404).json({ 
          success: false,
          error: 'QR code not found or invalid',
          valid: false 
        });
      }
      
      if (qrRecord.isUsed) {
        return res.status(400).json({ 
          success: false,
          error: 'QR code has already been used',
          valid: false,
          usedDate: qrRecord.scannedDate
        });
      }
      
      qrRecord.isUsed = true;
      qrRecord.scannedDate = new Date();
      qrRecord.scannedBy = req.user ? req.user._id : null;
      
      await qrRecord.save();
      // hthis func will add to users transcan history
      if (req.user) {
        const scanDetails = {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.connection.remoteAddress,
          location: req.body.location || null
        };
        
        await req.user.addTransaction(parsedData, scanDetails);
      }
      
      res.json({
        success: true,
        valid: true,
        data: {
          id: qrRecord.id,
          phpValue: qrRecord.phpValue,
          createdDate: qrRecord.createdDate,
          scannedDate: qrRecord.scannedDate
        },
        message: 'QR code scanned successfully'
      });
      
    } catch (error) {
      console.error('Error scanning QR code:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to scan QR code' 
      });
    }
  }

  // users transac HHHHHHH
  async getMyTransactions(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = req.user.getTransactionHistory(page, limit);
      
      res.json({
        success: true,
        data: result.transactions,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
      
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get transaction history' 
      });
    }
  }

  // user stats
  async getMyStats(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }
      
      const stats = req.user.getTransactionStats();
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get statistics' 
      });
    }
  }

  // QR code status
  async getQRStatus(req, res) {
    try {
      const { id } = req.params;
      
      const qrRecord = await QRCode.findOne({ id: id }).select('-qrData -hash');
      
      if (!qrRecord) {
        return res.status(404).json({ 
          success: false,
          error: 'QR code not found' 
        });
      }
      
      res.json({
        success: true,
        data: {
          id: qrRecord.id,
          phpValue: qrRecord.phpValue,
          createdDate: qrRecord.createdDate,
          scannedDate: qrRecord.scannedDate,
          isUsed: qrRecord.isUsed,
          status: qrRecord.isUsed ? 'used' : 'available'
        }
      });
      
    } catch (error) {
      console.error('Error getting QR status:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get QR status' 
      });
    }
  }
}

module.exports = new QRController();