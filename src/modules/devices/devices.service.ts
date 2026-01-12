import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../../database/schemas/device.schema';
import { DeviceShared, DeviceSharedDocument } from '../../database/schemas/device-shared.schema';
import { SignupUser, SignupUserDocument } from '../../database/schemas/signup-user.schema';
import { Switch, SwitchDocument } from '../../database/schemas/switch.schema';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(DeviceShared.name) private deviceSharedModel: Model<DeviceSharedDocument>,
    @InjectModel(SignupUser.name) private signupUserModel: Model<SignupUserDocument>,
    @InjectModel(Switch.name) private switchModel: Model<SwitchDocument>,
  ) {}

  async findAll(): Promise<DeviceDocument[]> {
    return this.deviceModel.find().exec();
  }

  async findById(id: string): Promise<DeviceDocument | null> {
    return this.deviceModel.findById(id).exec();
  }

  async findByUser(userId: string): Promise<DeviceDocument[]> {
    return this.deviceModel.find({ allocated_to_customer_id: userId }).sort({ allocated_at: -1 }).exec();
  }

  async findByDeviceCode(deviceCode: string): Promise<DeviceDocument | null> {
    return this.deviceModel.findOne({ device_code: deviceCode }).exec();
  }

  async findByRoom(roomId: string): Promise<DeviceDocument[]> {
    return this.deviceModel.find({ room_id: roomId }).exec();
  }

  async create(data: Partial<Device>): Promise<DeviceDocument> {
    const device = new this.deviceModel(data);
    return device.save();
  }

  async update(id: string, data: Partial<Device>): Promise<DeviceDocument | null> {
    return this.deviceModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<DeviceDocument | null> {
    await this.deviceSharedModel.deleteMany({ device_id: id }).exec();
    return this.deviceModel.findByIdAndDelete(id).exec();
  }

  async unassignDevice(id: string): Promise<DeviceDocument | null> {
    await this.deviceSharedModel.deleteMany({ device_id: id }).exec();
    await this.switchModel.deleteMany({ device_id: id }).exec();
    return this.deviceModel.findByIdAndUpdate(id, {
      allocated_to_customer_id: null,
      allocated_to_customer_name: null,
      allocated_at: null,
      device_name: null,
      room_id: null,
      electronic_object: null,
    }, { new: true }).exec();
  }

  async shareDevice(deviceId: string, sharedWithUserId: string): Promise<DeviceSharedDocument> {
    const shareRecord = new this.deviceSharedModel({
      device_id: deviceId,
      shared_with_user_id: sharedWithUserId,
      shared_at: new Date(),
    });
    return shareRecord.save();
  }

  async unshareDevice(deviceId: string, sharedWithUserId: string): Promise<boolean> {
    const result = await this.deviceSharedModel.deleteOne({
      device_id: deviceId,
      shared_with_user_id: sharedWithUserId,
    }).exec();
    return result.deletedCount > 0;
  }

  async getSharedWithUser(userId: string): Promise<DeviceDocument[]> {
    const sharedRecords = await this.deviceSharedModel.find({ shared_with_user_id: userId }).exec();
    const deviceIds = sharedRecords.map(r => r.device_id);
    return this.deviceModel.find({ _id: { $in: deviceIds } }).exec();
  }

  async isDeviceSharedWith(deviceId: string, userId: string): Promise<boolean> {
    const record = await this.deviceSharedModel.findOne({
      device_id: deviceId,
      shared_with_user_id: userId,
    }).exec();
    return !!record;
  }

  async findUserByPhone(phoneNumber: string): Promise<SignupUserDocument | null> {
    return this.signupUserModel.findOne({ phone_number: phoneNumber }).exec();
  }

  async createSwitchForDevice(data: {
    device_id: string;
    device_code: string;
    device_name?: string;
    device_m2m_number?: string;
    room_id: string;
    house_id: string;
    allocated_to_customer_id: string;
    allocated_to_customer_name?: string;
    electronic_object?: string;
    device_icon?: string;
    allocated_at?: Date;
  }): Promise<SwitchDocument | null> {
    const existingSwitch = await this.switchModel.findOne({ device_id: data.device_id }).exec();
    if (existingSwitch) {
      return this.switchModel.findByIdAndUpdate(existingSwitch._id, {
        ...data,
        switch_is_active: false,
      }, { new: true }).exec();
    }
    
    const switchRecord = new this.switchModel({
      ...data,
      switch_is_active: false,
    });
    return switchRecord.save();
  }

  async deleteSwitchForDevice(deviceId: string): Promise<boolean> {
    const result = await this.switchModel.deleteMany({ device_id: deviceId }).exec();
    return result.deletedCount > 0;
  }

  async getSwitchesByRoom(roomId: string): Promise<any[]> {
    const devices = await this.deviceModel.find({ room_id: roomId }).exec();
    const result = [];
    
    for (const device of devices) {
      const switchRecord = await this.switchModel.findOne({ device_id: device._id.toString() }).exec();
      result.push({
        ...device.toObject(),
        switch: switchRecord ? switchRecord.toObject() : null,
      });
    }
    
    return result;
  }
}
