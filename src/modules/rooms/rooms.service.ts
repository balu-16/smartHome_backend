import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from '../../database/schemas/room.schema';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
  ) {}

  async findByHouse(houseId: string): Promise<RoomDocument[]> {
    return this.roomModel.find({ house_id: houseId }).sort({ created_at: 1 }).exec();
  }

  async findById(id: string): Promise<RoomDocument | null> {
    return this.roomModel.findById(id).exec();
  }

  async create(data: { house_id: string; room_name: string }): Promise<RoomDocument> {
    const room = new this.roomModel(data);
    return room.save();
  }

  async update(id: string, data: { room_name: string }): Promise<RoomDocument | null> {
    return this.roomModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<RoomDocument | null> {
    return this.roomModel.findByIdAndDelete(id).exec();
  }
}
