import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { House, HouseDocument } from '../../database/schemas/house.schema';
import { Room, RoomDocument } from '../../database/schemas/room.schema';

@Injectable()
export class HousesService {
  constructor(
    @InjectModel(House.name) private houseModel: Model<HouseDocument>,
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
  ) {}

  async findByUser(userId: string): Promise<HouseDocument[]> {
    return this.houseModel.find({ user_id: userId }).sort({ created_at: 1 }).exec();
  }

  async findById(id: string): Promise<HouseDocument | null> {
    return this.houseModel.findById(id).exec();
  }

  async create(data: { user_id: string; house_name: string }): Promise<HouseDocument> {
    const house = new this.houseModel(data);
    return house.save();
  }

  async update(id: string, data: { house_name: string }): Promise<HouseDocument | null> {
    return this.houseModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<HouseDocument | null> {
    await this.roomModel.deleteMany({ house_id: id }).exec();
    return this.houseModel.findByIdAndDelete(id).exec();
  }
}
