import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { GpsService } from './gps.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateActiveDto } from './dto/update-active.dto';
import { getISTTimestamp } from '../../common/utils/time.utils';

@Controller('v1/gps-signal')
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Post('update-location')
  async updateLocation(@Body() updateLocationDto: UpdateLocationDto) {
    try {
      const {
        device_code,
        device_m2m_number,
        latitude,
        longitude,
        accuracy,
      } = updateLocationDto;

      if (!device_code || !device_m2m_number) {
        throw new HttpException(
          {
            success: false,
            error: 'Both device_code and device_m2m_number are required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!/^[0-9]{13}$/.test(device_m2m_number)) {
        throw new HttpException(
          {
            success: false,
            error: 'device_m2m_number must be exactly 13 digits (0-9 only)',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('📍 Received location update:', {
        device_code,
        device_m2m_number,
        latitude,
        longitude,
        accuracy,
      });

      const deviceInfo = await this.gpsService.findDeviceByCodeAndM2m(
        device_code,
        device_m2m_number,
      );

      if (!deviceInfo) {
        throw new HttpException(
          {
            success: false,
            error:
              'Device not found or device_code and device_m2m_number do not belong to the same device',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const gpsData = await this.gpsService.insertGpsData({
        device_code: deviceInfo.device_code,
        latitude,
        longitude,
        user_id: deviceInfo.allocated_to_customer_id,
        accuracy,
        timestamp: new Date(getISTTimestamp()),
      });

      console.log('✅ GPS data stored successfully:', gpsData);

      return {
        success: true,
        message: 'Location updated successfully',
        data: {
          _id: gpsData._id,
          device_code: gpsData.device_code,
          latitude: gpsData.latitude,
          longitude: gpsData.longitude,
          user_id: gpsData.user_id,
          accuracy: gpsData.accuracy,
          timestamp: gpsData.timestamp,
        },
      };
    } catch (error: any) {
      console.error('Update location error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          error: 'Internal server error',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('current-location')
  getCurrentLocation() {
    return {
      status: 'success',
      location: this.gpsService.getCurrentUserLocation(),
    };
  }

  @Get(':device_code')
  async getDeviceGps(@Param('device_code') deviceCode: string) {
    try {
      console.log(`📡 GPS request for device: ${deviceCode}`);

      const device = await this.gpsService.findDeviceByCode(deviceCode);

      if (!device) {
        console.log(`❌ Device not found: ${deviceCode}`);
        throw new HttpException(
          {
            error: 'Device not found',
            device_code: deviceCode,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (!device.is_active) {
        console.log(`⏸️ Device inactive: ${deviceCode}`);
        throw new HttpException(
          {
            error: 'Device tracking is disabled',
            device_code: deviceCode,
            is_active: false,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const currentLocation = this.gpsService.getCurrentUserLocation();

      if (
        !currentLocation.hasPermission ||
        currentLocation.latitude === null ||
        currentLocation.longitude === null
      ) {
        console.log('❌ No real GPS coordinates available');
        throw new HttpException(
          {
            error: 'GPS coordinates not available',
            message:
              'Please ensure GPS permission is granted and location is being tracked',
            device_code: deviceCode,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('✅ Using real GPS coordinates');

      const gpsData = await this.gpsService.insertGpsData({
        device_code: deviceCode,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        user_id: device.allocated_to_customer_id,
        timestamp: new Date(getISTTimestamp()),
      });

      return {
        device_code: deviceCode,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        timestamp: gpsData.timestamp,
        user_id: device.allocated_to_customer_id,
        device_name: device.device_name,
        status: 'active',
      };
    } catch (error: any) {
      console.error('GPS endpoint error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          error: 'Internal server error',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':device_code/history')
  async getGpsHistory(@Param('device_code') deviceCode: string) {
    try {
      const gpsHistory = await this.gpsService.getGpsHistory(deviceCode);

      return {
        status: 'success',
        device_code: deviceCode,
        count: gpsHistory.length,
        data: gpsHistory,
      };
    } catch (error: any) {
      console.error('GPS history error:', error);
      throw new HttpException(
        {
          error: 'Internal server error',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('device/:deviceCode/data')
  async getGpsData(@Param('deviceCode') deviceCode: string) {
    try {
      console.log('📡 Fetching GPS data for device:', deviceCode);

      const data = await this.gpsService.getGpsDataForDevice(deviceCode);

      console.log(
        `✅ Found ${data?.length || 0} GPS points for device ${deviceCode}`,
      );

      return {
        success: true,
        data: data || [],
        count: data?.length || 0,
      };
    } catch (error: any) {
      console.error('Error in GPS data endpoint:', error);
      throw new HttpException(
        {
          success: false,
          error: 'Internal server error',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('device/:deviceCode/clear')
  async clearGpsData(@Param('deviceCode') deviceCode: string) {
    try {
      console.log('🗑️ Clearing GPS data for device:', deviceCode);

      const result = await this.gpsService.clearGpsData(deviceCode);

      console.log(
        `✅ Cleared ${result.deletedCount} GPS points for device ${deviceCode}`,
      );

      return {
        success: true,
        message: `All GPS data cleared for device ${deviceCode}`,
        deletedCount: result.deletedCount,
      };
    } catch (error: any) {
      console.error('Error in GPS clear endpoint:', error);
      throw new HttpException(
        {
          success: false,
          error: 'Internal server error',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('device/:device_code/active')
  async updateActiveStatus(
    @Param('device_code') deviceCode: string,
    @Body() updateActiveDto: UpdateActiveDto,
  ) {
    try {
      const { is_active } = updateActiveDto;

      if (typeof is_active !== 'boolean') {
        throw new HttpException(
          {
            error: 'is_active must be a boolean',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedDevice = await this.gpsService.updateDeviceActiveStatus(
        deviceCode,
        is_active,
      );

      if (!updatedDevice) {
        throw new HttpException(
          {
            error: 'Device not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        device_code: deviceCode,
        is_active: updatedDevice.is_active,
        message: `Device tracking has been ${is_active ? 'enabled' : 'disabled'}`,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          error: 'Internal server error',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
