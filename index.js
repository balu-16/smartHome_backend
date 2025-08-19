import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import gpsRoutes from './routes/gps.js';
import authRoutes from './routes/auth.js';
import supabase from './supabaseClient.js';
import { WorkingOtpService } from './test-otp.js';
import { getISTTimestamp } from './utils/timeUtils.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/v1/gps-signal', gpsRoutes);
app.use('/v1/auth', authRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('otp_verifications')
      .select('count')
      .limit(1);
    
    res.json({
      status: 'healthy',
      timestamp: getISTTimestamp(),
      supabase: {
        status: error ? 'error' : 'connected',
        error: error?.message
      },
      services: {
        sms: 'available',
        otp: 'available'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: getISTTimestamp(),
      error: error.message
    });
  }
});

// SMS API endpoint - using WorkingOtpService
app.post('/v1/sms/send', async (req, res) => {
  console.log('📱 SMS endpoint called!');
  console.log('📱 Request body:', req.body);
  console.log('📱 Request headers:', req.headers);
  
  try {
    const { phoneNumber, message } = req.body;
    
    console.log(`📱 Received SMS request for ${phoneNumber}`);
    console.log(`📱 Message: ${message}`);
    
    if (!phoneNumber) {
      console.log('❌ Missing phoneNumber');
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    // Extract OTP from message if it contains one
    const otpMatch = message.match(/\b\d{6}\b/);
    if (otpMatch) {
      const otp = otpMatch[0];
      console.log(`📱 Detected OTP in message: ${otp}`);
      
      // Use WorkingOtpService to send OTP SMS
      const result = await WorkingOtpService.sendOtpSms(phoneNumber, otp);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } else {
      console.log('❌ No OTP found in message');
      res.status(400).json({
        success: false,
        error: 'Message must contain a 6-digit OTP'
      });
    }
    
  } catch (error) {
    console.error('📱 SMS Service Error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to send SMS: ${error.message}`
    });
  }
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl 
  });
});

// House management service - no GPS simulation needed
// Device monitoring functionality removed

// Export the Express app for Vercel
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 House Management Backend Server running on port ${PORT}`);
    console.log(`📱 Device management ready`);
  });

  // Graceful shutdown for local development
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down House Management Backend Server...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down House Management Backend Server...');
    process.exit(0);
  });
}