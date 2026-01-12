import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Switch, SwitchDocument } from '../../database/schemas/switch.schema';

@Injectable()
export class SwitchesService {
  constructor(
    @InjectModel(Switch.name) private switchModel: Model<SwitchDocument>,
  ) {}

  async findByDevice(deviceId: string): Promise<SwitchDocument[]> {
    return this.switchModel.find({ device_id: deviceId }).sort({ created_at: 1 }).exec();
  }

  async findByRoom(roomId: string): Promise<SwitchDocument[]> {
    return this.switchModel.find({ room_id: roomId }).sort({ created_at: -1 }).exec();
  }

  async findByHouse(houseId: string): Promise<SwitchDocument[]> {
    return this.switchModel.find({ house_id: houseId }).sort({ created_at: -1 }).exec();
  }

  async findByUser(userId: string): Promise<SwitchDocument[]> {
    return this.switchModel.find({ allocated_to_customer_id: userId }).sort({ created_at: -1 }).exec();
  }

  async findById(id: string): Promise<SwitchDocument | null> {
    return this.switchModel.findById(id).exec();
  }

  async create(data: Partial<Switch>): Promise<SwitchDocument> {
    const switchItem = new this.switchModel(data);
    return switchItem.save();
  }

  async update(id: string, data: Partial<Switch>): Promise<SwitchDocument | null> {
    return this.switchModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<SwitchDocument | null> {
    return this.switchModel.findByIdAndDelete(id).exec();
  }

  async toggleSwitch(id: string): Promise<SwitchDocument | null> {
    const switchItem = await this.switchModel.findById(id).exec();
    if (!switchItem) return null;
    return this.switchModel.findByIdAndUpdate(id, {
      switch_is_active: !switchItem.switch_is_active,
    }, { new: true }).exec();
  }
}
