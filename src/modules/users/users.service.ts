import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SuperAdmin, SuperAdminDocument } from '../../database/schemas/super-admin.schema';
import { EmployeeData, EmployeeDataDocument } from '../../database/schemas/employee-data.schema';
import { User, UserDocument } from '../../database/schemas/signup-user.schema';
import { Technician, TechnicianDocument } from '../../database/schemas/technician.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(SuperAdmin.name) private superAdminModel: Model<SuperAdminDocument>,
    @InjectModel(EmployeeData.name) private employeeDataModel: Model<EmployeeDataDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Technician.name) private technicianModel: Model<TechnicianDocument>,
  ) {}

  async findByPhone(phoneNumber: string): Promise<{ user: any; userType: string } | null> {
    const superAdmin = await this.superAdminModel.findOne({ phone_number: phoneNumber }).exec();
    if (superAdmin) return { user: superAdmin, userType: 'superadmin' };

    const employee = await this.employeeDataModel.findOne({ phone_number: phoneNumber }).exec();
    if (employee) return { user: employee, userType: 'admin' };

    const technician = await this.technicianModel.findOne({ phone_number: phoneNumber }).exec();
    if (technician) return { user: technician, userType: 'technician' };

    const customer = await this.userModel.findOne({ phone_number: phoneNumber }).exec();
    if (customer) return { user: customer, userType: 'customer' };

    return null;
  }

  async findById(id: string): Promise<{ user: any; userType: string } | null> {
    try {
      const superAdmin = await this.superAdminModel.findById(id).exec();
      if (superAdmin) return { user: superAdmin, userType: 'superadmin' };

      const employee = await this.employeeDataModel.findById(id).exec();
      if (employee) return { user: employee, userType: 'admin' };

      const technician = await this.technicianModel.findById(id).exec();
      if (technician) return { user: technician, userType: 'technician' };

      const customer = await this.userModel.findById(id).exec();
      if (customer) return { user: customer, userType: 'customer' };
    } catch (error) {
      return null;
    }
    return null;
  }

  async getAllSuperAdmins(): Promise<SuperAdminDocument[]> {
    return this.superAdminModel.find().exec();
  }

  async getAllEmployees(): Promise<EmployeeDataDocument[]> {
    return this.employeeDataModel.find().exec();
  }

  async getAllCustomers(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async getAllTechnicians(): Promise<TechnicianDocument[]> {
    return this.technicianModel.find().exec();
  }

  async createCustomer(data: { phone_number: string; full_name: string; email?: string }): Promise<UserDocument> {
    const customer = new this.userModel(data);
    return customer.save();
  }
}
