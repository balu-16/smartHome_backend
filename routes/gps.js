import express from 'express';
import supabase from '../supabaseClient.js';
import { getISTTimestamp } from '../utils/timeUtils.js';

const router = express.Router();

// Store current user location (will be updated by frontend)
let currentUserLocation = {
  latitude: null,
  longitude: null,
  timestamp: null,
  hasPermission: false
};

// Endpoint to update user's current location
router.post('/update-location', async (req, res) => {
  try {
    const { device_code, device_m2m_number, latitude, longitude, accuracy, timestamp } = req.body;

    // Require both device_code and device_m2m_number to be provided
    if (!device_code || !device_m2m_number) {
      return res.status(400).json({
        success: false,
        error: 'Both device_code and device_m2m_number are required'
      });
    }

    // Validate device_m2m_number format (must be exactly 13 digits)
    if (!/^[0-9]{13}$/.test(device_m2m_number)) {
      return res.status(400).json({
        success: false,
        error: 'device_m2m_number must be exactly 13 digits (0-9 only)'
      });
    }

    // Store GPS data in database
    console.log('📍 Received location update:', {
      device_code,
      device_m2m_number,
      latitude,
      longitude,
      accuracy,
      timestamp
    });

    // Validate that both device_code and device_m2m_number belong to the same device
    const { data: deviceInfo, error: deviceError } = await supabase
      .from('devices')
      .select('device_code, device_m2m_number, allocated_to_customer_id')
      .eq('device_code', device_code)
      .eq('device_m2m_number', device_m2m_number)
      .single();

      if (deviceError) {
        console.error('❌ Error fetching device info:', deviceError);
        if (deviceError.code === 'PGRST116') {
          // No rows returned - device not found or device_code/device_m2m_number don't match
          return res.status(404).json({
            success: false,
            error: 'Device not found or device_code and device_m2m_number do not belong to the same device'
          });
        }
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch device information',
          details: deviceError.message
        });
      }

      // Insert GPS data into Supabase
      const { data, error } = await supabase
        .from('gps_data')
        .insert({
          device_code: deviceInfo.device_code, // Use device_code from database
          latitude: latitude,
          longitude: longitude,
          user_id: deviceInfo.allocated_to_customer_id,
          accuracy,
          timestamp: getISTTimestamp() // Store in IST
        })
        .select();

      if (error) {
        console.error('❌ Error inserting GPS data:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to store GPS data',
          details: error.message
        });
      }

      console.log('✅ GPS data stored successfully:', data);
      return res.json({
        success: true,
        message: 'Location updated successfully',
        data: data[0]
      });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Endpoint to get current user location
router.get('/current-location', (req, res) => {
  res.status(200).json({
    status: 'success',
    location: currentUserLocation
  });
});

// Main GPS endpoint for device tracking
router.get('/:device_code', async (req, res) => {
  try {
    const { device_code } = req.params;
    
    console.log(`📡 GPS request for device: ${device_code}`);
    console.log('Current user location:', currentUserLocation);

    // Verify device exists and is active
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('device_code', device_code)
      .single();

    if (deviceError || !device) {
      console.log(`❌ Device not found: ${device_code}`);
      return res.status(404).json({
        error: 'Device not found',
        device_code
      });
    }

    if (!device.is_active) {
      console.log(`⏸️ Device inactive: ${device_code}`);
      return res.status(403).json({
        error: 'Device tracking is disabled',
        device_code,
        is_active: false
      });
    }

    // Check if real GPS coordinates are available
    if (!currentUserLocation.hasPermission || 
        currentUserLocation.latitude === null || 
        currentUserLocation.longitude === null) {
      console.log('❌ No real GPS coordinates available');
      return res.status(400).json({
        error: 'GPS coordinates not available',
        message: 'Please ensure GPS permission is granted and location is being tracked',
        device_code
      });
    }

    console.log('✅ Using real GPS coordinates');
    
    const latitude = currentUserLocation.latitude;
    const longitude = currentUserLocation.longitude;

    console.log(`📍 GPS coordinates: ${latitude}, ${longitude}`);

    // Store GPS data in Supabase
    const { data: gpsData, error: insertError } = await supabase
      .from('gps_data')
      .insert([{
        device_code,
        latitude,
        longitude,
        user_id: device.allocated_to_customer_id,
        timestamp: getISTTimestamp() // Store in IST
      }])
      .select()
      .single();

    if (insertError) {
      console.error('GPS insert error:', insertError);
      return res.status(500).json({
        error: 'Failed to save GPS data',
        details: insertError.message
      });
    }

    res.status(200).json({
      device_code,
      latitude,
      longitude,
      timestamp: gpsData.timestamp,
      user_id: device.allocated_to_customer_id,
      device_name: device.device_name,
      status: 'active'
    });

  } catch (error) {
    console.error('GPS endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get GPS history for a device
router.get('/:device_code/history', async (req, res) => {
  try {
    const { device_code } = req.params;
    // Removed limit to allow unlimited GPS coordinates

    const { data: gpsHistory, error } = await supabase
      .from('gps_data')
      .select('*')
      .eq('device_code', device_code)
      .order('timestamp', { ascending: false });

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch GPS history',
        details: error.message
      });
    }

    res.status(200).json({
      status: 'success',
      device_code,
      count: gpsHistory.length,
      data: gpsHistory.reverse() // Return in chronological order
    });

  } catch (error) {
    console.error('GPS history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get GPS data for a specific device (for frontend map)
router.get('/device/:deviceCode/data', async (req, res) => {
  try {
    const { deviceCode } = req.params;

    console.log('📡 Fetching GPS data for device:', deviceCode);

    // Fetch GPS data from Supabase
    const { data, error } = await supabase
      .from('gps_data')
      .select('*')
      .eq('device_code', deviceCode)
      .order('timestamp', { ascending: true })
      // Removed limit to allow unlimited GPS coordinates

    if (error) {
      console.error('❌ Error fetching GPS data:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch GPS data',
        details: error.message
      });
    }

    console.log(`✅ Found ${data?.length || 0} GPS points for device ${deviceCode}`);

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Error in GPS data endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Clear all GPS data for a specific device
router.delete('/device/:deviceCode/clear', async (req, res) => {
  try {
    const { deviceCode } = req.params;

    console.log('🗑️ Clearing GPS data for device:', deviceCode);

    // Delete all GPS data for the device from Supabase
    const { data, error } = await supabase
      .from('gps_data')
      .delete()
      .eq('device_code', deviceCode)
      .select();

    if (error) {
      console.error('❌ Error clearing GPS data:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to clear GPS data',
        details: error.message
      });
    }

    console.log(`✅ Cleared ${data?.length || 0} GPS points for device ${deviceCode}`);

    res.json({
      success: true,
      message: `All GPS data cleared for device ${deviceCode}`,
      deletedCount: data?.length || 0
    });

  } catch (error) {
    console.error('Error in GPS clear endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Endpoint to update is_active status for a device
router.post('/device/:device_code/active', async (req, res) => {
  try {
    const { device_code } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        error: 'is_active must be a boolean',
      });
    }

    // Update the is_active status in the devices table
    const { data, error } = await supabase
      .from('devices')
      .update({ is_active })
      .eq('device_code', device_code)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: 'Failed to update is_active status',
        details: error.message,
      });
    }

    res.status(200).json({
      success: true,
      device_code,
      is_active: data.is_active,
      message: `Device tracking has been ${is_active ? 'enabled' : 'disabled'}`,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

export default router;