import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../../database/schemas/device.schema';
import { GpsData, GpsDataDocument } from '../../database/schemas/gps-data.schema';
import { getISTTimestamp } from '../../common/utils/time.utils';

export interface CurrentUserLocation {
  latitude: number | null;
  longitude: number | null;
  timestamp: string | null;
  hasPermission: boolean;
}

@Injectable()
export class GpsService {
  private currentUserLocation: CurrentUserLocation = {
    latitude: null,
    longitude: null,
    timestamp: null,
    hasPermission: false,
  };

  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(GpsData.name) private gpsDataModel: Model<GpsDataDocument>,
  ) {}

  getCurrentUserLocation(): CurrentUserLocation {
    return this.currentUserLocation;
  }

  setCurrentUserLocation(location: Partial<CurrentUserLocation>): void {
    this.currentUserLocation = { ...this.currentUserLocation, ...location };
  }

  async findDeviceByCodeAndM2m(
    deviceCode: string,
    deviceM2mNumber: string,
  ): Promise<DeviceDocument | null> {
    return this.deviceModel
      .findOne({
        device_code: deviceCode,
        device_m2m_number: deviceM2mNumber,
      })
      .exec();
  }

  async findDeviceByCode(deviceCode: string): Promise<DeviceDocument | null> {
    return this.deviceModel.findOne({ device_code: deviceCode }).exec();
  }

  async insertGpsData(data: {
    device_code: string;
    latitude: number;
    longitude: number;
    user_id?: string;
    accuracy?: number;
    timestamp?: Date;
  }): Promise<GpsDataDocument> {
    const gpsRecord = new this.gpsDataModel({
      device_code: data.device_code,
      latitude: data.latitude,
      longitude: data.longitude,
      user_id: data.user_id,
      accuracy: data.accuracy,
      timestamp: data.timestamp || new Date(getISTTimestamp()),
    });

    return gpsRecord.save();
  }

  async getGpsHistory(deviceCode: string): Promise<GpsDataDocument[]> {
    const history = await this.gpsDataModel
      .find({ device_code: deviceCode })
      .sort({ timestamp: -1 })
      .exec();

    // Return in chronological order
    return history.reverse();
  }

  async getGpsDataForDevice(deviceCode: string): Promise<GpsDataDocument[]> {
    return this.gpsDataModel
      .find({ device_code: deviceCode })
      .sort({ timestamp: 1 })
      .exec();
  }

  async clearGpsData(
    deviceCode: string,
  ): Promise<{ deletedCount: number }> {
    const result = await this.gpsDataModel
      .deleteMany({ device_code: deviceCode })
      .exec();
    return { deletedCount: result.deletedCount || 0 };
  }

  async updateDeviceActiveStatus(
    deviceCode: string,
    isActive: boolean,
  ): Promise<DeviceDocument | null> {
    return this.deviceModel
      .findOneAndUpdate(
        { device_code: deviceCode },
        { is_active: isActive },
        { new: true },
      )
      .exec();
  }
}
