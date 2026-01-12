import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Technician,
  TechnicianDocument,
} from '../../database/schemas/technician.schema';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
  ) {}

  async findAll(): Promise<TechnicianDocument[]> {
    return this.technicianModel.find().sort({ created_at: -1 }).exec();
  }

  async findById(id: string): Promise<TechnicianDocument | null> {
    return this.technicianModel.findById(id).exec();
  }

  async findByPhone(phoneNumber: string): Promise<TechnicianDocument | null> {
    return this.technicianModel.findOne({ phone_number: phoneNumber }).exec();
  }

  async create(data: {
    phone_number: string;
    full_name: string;
    email?: string;
    employee_id?: string;
    added_by: string;
  }): Promise<TechnicianDocument> {
    const technician = new this.technicianModel(data);
    return technician.save();
  }

  async update(
    id: string,
    data: Partial<{
      full_name: string;
      email: string;
      is_active: boolean;
    }>,
  ): Promise<TechnicianDocument | null> {
    return this.technicianModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.technicianModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async toggleActive(id: string): Promise<TechnicianDocument | null> {
    const technician = await this.technicianModel.findById(id).exec();
    if (!technician) return null;

    technician.is_active = !technician.is_active;
    return technician.save();
  }
}
