import express from 'express';
import { WorkingOtpService } from '../test-otp.js';
import supabase from '../supabaseClient.js';

const router = express.Router();

// Send OTP endpoint - Fixed to allow signup for new users
router.post('/send-otp', async (req, res) => {
  console.log('📱 Send OTP endpoint called');
  console.log('📱 Request body:', req.body);

  try {
    const { phoneNumber, name } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
        message: 'Phone number must be provided'
      });
    }

    // Format phone number
    const formattedPhone = WorkingOtpService.formatPhoneNumber(phoneNumber);

    // Validate phone number
    if (!WorkingOtpService.validatePhoneNumber(formattedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
        message: 'Phone number must be a valid 10-digit Indian mobile number starting with 6-9'
      });
    }

    // Check if user exists in any of the user tables
    let userExists = false;
    let userType = null;
    let existingUser = null;

    // Check super_admins table
    const { data: superAdminUser, error: superAdminError } = await supabase
      .from('super_admins')
      .select('*')
      .eq('phone_number', formattedPhone)
      .single();

    if (!superAdminError && superAdminUser) {
      userExists = true;
      userType = 'superadmin';
      existingUser = superAdminUser;
      console.log(`📱 Super admin found: ${existingUser.full_name}`);
    }

    // Check employee_data table if not found in super_admins
    if (!userExists) {
      const { data: adminUser, error: adminError } = await supabase
        .from('employee_data')
        .select('*')
        .eq('phone_number', formattedPhone)
        .single();

      if (!adminError && adminUser) {
        userExists = true;
        userType = 'admin';
        existingUser = adminUser;
        console.log(`📱 Admin found: ${existingUser.full_name}`);
      }
    }

    // Check signup_users table if not found in other tables
    if (!userExists) {
      const { data: customerUser, error: customerError } = await supabase
        .from('signup_users')
        .select('*')
        .eq('phone_number', formattedPhone)
        .single();

      if (!customerError && customerUser) {
        userExists = true;
        userType = 'customer';
        existingUser = customerUser;
        console.log(`📱 Customer found: ${existingUser.full_name}`);
      }
    }

    let message = '';
    if (userExists) {
      message = `OTP sent successfully for ${userType} login`;
      console.log(`📱 Existing ${userType} user found: ${existingUser.full_name}`);
    } else {
      message = 'OTP sent successfully for registration';
      console.log(`📱 New user signup for: ${formattedPhone}`);
      // Note: We allow new users to proceed with OTP generation
    }

    // Send OTP using the restored OTP service
    console.log(`📱 Using OtpService for ${formattedPhone}`);
    const result = await WorkingOtpService.sendOTP(formattedPhone, name);

    console.log(`📱 OtpService Result:`, result);

    // Check if SMS was sent successfully
    const smsSuccess = result.smsResult && result.smsResult.success;

    if (!smsSuccess) {
      console.error(`❌ SMS failed but OTP was stored in database for ${formattedPhone}`);
      console.error(`❌ SMS Error:`, result.smsResult);
    }

    res.status(200).json({
      success: true,
      message: smsSuccess ? message : `${message} (SMS delivery may have failed)`,
      phoneNumber: formattedPhone,
      userExists,
      smsStatus: smsSuccess,
      smsDetails: result.smsResult || { success: false, error: 'SMS service unavailable' },
      debug: {
        generatedOtp: result.otp, // For debugging - remove in production
        service: 'OtpService'
      }
    });

  } catch (error) {
    console.error('📱 Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
      message: error.message
    });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  console.log('🔐 Verify OTP endpoint called');
  console.log('🔐 Request body:', req.body);

  try {
    const { phoneNumber, otp, name } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and OTP are required',
        message: 'Both phone number and OTP must be provided'
      });
    }

    // Format phone number
    const formattedPhone = WorkingOtpService.formatPhoneNumber(phoneNumber);

    // Validate phone number
    if (!WorkingOtpService.validatePhoneNumber(formattedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
        message: 'Phone number must be a valid 10-digit Indian mobile number starting with 6-9'
      });
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP format',
        message: 'OTP must be a 6-digit number'
      });
    }

    // Verify OTP using the restored OTP service
    const otpResult = await WorkingOtpService.verifyOTP(formattedPhone, otp);

    if (!otpResult.isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired OTP',
        message: otpResult.message
      });
    }

    // Check if user exists in any of the user tables
    let user = null;
    let userType = null;
    let isNewUser = false;
    let message = '';

    // Check super_admins table
    const { data: superAdminUser, error: superAdminError } = await supabase
      .from('super_admins')
      .select('*')
      .eq('phone_number', formattedPhone)
      .single();

    if (!superAdminError && superAdminUser) {
      user = superAdminUser;
      userType = 'superadmin';
      message = 'Super admin login successful';
      console.log(`✅ Super admin logged in: ${user.full_name}`);
    }

    // Check employee_data table if not found in super_admins
    if (!user) {
      const { data: adminUser, error: adminError } = await supabase
        .from('employee_data')
        .select('*')
        .eq('phone_number', formattedPhone)
        .single();

      if (!adminError && adminUser) {
        user = adminUser;
        userType = 'admin';
        message = 'Admin login successful';
        console.log(`✅ Admin logged in: ${user.full_name}`);
      }
    }

    // Check signup_users table if not found in other tables
    if (!user) {
      const { data: customerUser, error: customerError } = await supabase
        .from('signup_users')
        .select('*')
        .eq('phone_number', formattedPhone)
        .single();

      if (!customerError && customerUser) {
        user = customerUser;
        userType = 'customer';
        message = 'Customer login successful';
        console.log(`✅ Customer logged in: ${user.full_name}`);
      }
    }

    // If user doesn't exist in any table, create new user in super_admins (registration)
    if (!user) {
      const userName = name || `User_${formattedPhone.slice(-4)}`;

      const { data: newUser, error: createError } = await supabase
        .from('super_admins')
        .insert({
          phone_number: formattedPhone,
          full_name: userName
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create user account',
          message: createError.message
        });
      }

      user = newUser;
      userType = 'superadmin';
      isNewUser = true;
      message = 'Registration successful';
      console.log(`✅ New user created: ${user.full_name}`);
    }

    // Generate a simple session token (in production, use JWT)
    const sessionToken = `session_${user.id}_${Date.now()}`;

    res.status(200).json({
      success: true,
      message,
      isNewUser,
      userType,
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        name: user.full_name,
        createdAt: user.created_at,
        role: userType
      },
      sessionToken,
      otpVerified: true
    });

  } catch (error) {
    console.error('🔐 Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'OTP verification failed',
      message: error.message
    });
  }
});

// Get user profile endpoint (requires session token)
router.get('/profile/:sessionToken', async (req, res) => {
  console.log('👤 Get profile endpoint called');

  try {
    const { sessionToken } = req.params;

    if (!sessionToken || !sessionToken.startsWith('session_')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session token',
        message: 'Valid session token is required'
      });
    }

    // Extract user ID from session token
    const parts = sessionToken.split('_');
    if (parts.length < 3) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session token format',
        message: 'Session token format is invalid'
      });
    }

    const userId = parts[1];

    // Get user from database
    const { data: user, error } = await supabase
      .from('super_admins')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        name: user.full_name,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('👤 Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
      message: error.message
    });
  }
});

// Update user profile endpoint
router.put('/profile/:sessionToken', async (req, res) => {
  console.log('✏️ Update profile endpoint called');

  try {
    const { sessionToken } = req.params;
    const { name } = req.body;

    if (!sessionToken || !sessionToken.startsWith('session_')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session token',
        message: 'Valid session token is required'
      });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid name',
        message: 'Name must be at least 2 characters long'
      });
    }

    // Extract user ID from session token
    const parts = sessionToken.split('_');
    const userId = parts[1];

    // Update user in database
    const { data: updatedUser, error } = await supabase
      .from('super_admins')
      .update({ full_name: name.trim() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        message: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        phoneNumber: updatedUser.phone_number,
        name: updatedUser.full_name,
        createdAt: updatedUser.created_at
      }
    });

  } catch (error) {
    console.error('✏️ Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// Cleanup expired OTPs endpoint (admin utility)
router.post('/cleanup-otps', async (req, res) => {
  console.log('🧹 Cleanup OTPs endpoint called');

  try {
    await WorkingOtpService.cleanupExpiredOTPs();

    res.status(200).json({
      success: true,
      message: 'Expired OTPs cleaned up successfully'
    });

  } catch (error) {
    console.error('🧹 Cleanup OTPs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup expired OTPs',
      message: error.message
    });
  }
});

export default router;