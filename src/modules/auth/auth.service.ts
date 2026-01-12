import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import {
  SuperAdmin,
  SuperAdminDocument,
} from '../../database/schemas/super-admin.schema';
import {
  EmployeeData,
  EmployeeDataDocument,
} from '../../database/schemas/employee-data.schema';
import {
  User,
  UserDocument,
} from '../../database/schemas/signup-user.schema';
import {
  Technician,
  TechnicianDocument,
} from '../../database/schemas/technician.schema';
import { UserLoginLog } from '../../database/schemas/user-login-log.schema';
import { SuperAdminLoginLog } from '../../database/schemas/superadmin-login-log.schema';
import { TechnicianLoginLog } from '../../database/schemas/technician-login-log.schema';
import { EmployeeLoginLog } from '../../database/schemas/employee-login-log.schema';
import { OtpService } from './otp.service';

const JWT_SECRET = process.env.JWT_SECRET || 'smarthome-jwt-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

interface UserInfo {
  exists: boolean;
  userType: 'superadmin' | 'admin' | 'customer' | 'technician' | null;
  user: SuperAdminDocument | EmployeeDataDocument | UserDocument | TechnicianDocument | null;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(SuperAdmin.name)
    private superAdminModel: Model<SuperAdminDocument>,
    @InjectModel(EmployeeData.name)
    private employeeDataModel: Model<EmployeeDataDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
    @InjectModel(UserLoginLog.name)
    private userLoginLogModel: Model<any>,
    @InjectModel(SuperAdminLoginLog.name)
    private superAdminLoginLogModel: Model<any>,
    @InjectModel(TechnicianLoginLog.name)
    private technicianLoginLogModel: Model<any>,
    @InjectModel(EmployeeLoginLog.name)
    private employeeLoginLogModel: Model<any>,
    private otpService: OtpService,
  ) {}

  async findUserByPhone(phoneNumber: string): Promise<UserInfo> {
    // Check super_admins table
    const superAdminUser = await this.superAdminModel
      .findOne({ phone_number: phoneNumber })
      .exec();

    if (superAdminUser) {
      console.log(`📱 Super admin found: ${superAdminUser.full_name}`);
      return {
        exists: true,
        userType: 'superadmin',
        user: superAdminUser,
      };
    }

    // Check employee_data table
    const adminUser = await this.employeeDataModel
      .findOne({ phone_number: phoneNumber })
      .exec();

    if (adminUser) {
      console.log(`📱 Admin found: ${adminUser.full_name}`);
      return {
        exists: true,
        userType: 'admin',
        user: adminUser,
      };
    }

    // Check technicians table
    const technicianUser = await this.technicianModel
      .findOne({ phone_number: phoneNumber })
      .exec();

    if (technicianUser) {
      console.log(`📱 Technician found: ${technicianUser.full_name}`);
      return {
        exists: true,
        userType: 'technician',
        user: technicianUser,
      };
    }

    // Check users table (customers)
    const customerUser = await this.userModel
      .findOne({ phone_number: phoneNumber })
      .exec();

    if (customerUser) {
      console.log(`📱 Customer found: ${customerUser.full_name}`);
      return {
        exists: true,
        userType: 'customer',
        user: customerUser,
      };
    }

    console.log(`📱 User not found for: ${phoneNumber}`);
    return {
      exists: false,
      userType: null,
      user: null,
    };
  }

  async createUser(
    phoneNumber: string,
    name: string,
    email?: string,
  ): Promise<UserDocument> {
    const newUser = new this.userModel({
      phone_number: phoneNumber,
      full_name: name,
      email: email || '',
    });

    const saved = await newUser.save();
    console.log(`✅ New user created: ${saved.full_name}, email: ${saved.email}`);
    return saved;
  }

  async getUserById(userId: string): Promise<any> {
    // Try to find in all user tables
    const superAdmin = await this.superAdminModel.findById(userId).exec();
    if (superAdmin) return { user: superAdmin, userType: 'superadmin' };

    const employee = await this.employeeDataModel.findById(userId).exec();
    if (employee) return { user: employee, userType: 'admin' };

    const technician = await this.technicianModel.findById(userId).exec();
    if (technician) return { user: technician, userType: 'technician' };

    const customer = await this.userModel.findById(userId).exec();
    if (customer) return { user: customer, userType: 'customer' };

    return null;
  }

  async updateUserProfile(
    userId: string,
    name: string,
    userType: string,
  ): Promise<any> {
    const updateData = { full_name: name.trim() };
    
    switch (userType) {
      case 'superadmin':
        return this.superAdminModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
      case 'admin':
        return this.employeeDataModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
      case 'technician':
        return this.technicianModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
      case 'customer':
        return this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
      default:
        return null;
    }
  }

  // JWT Token Generation
  generateJwtToken(userId: string, userType: string, phoneNumber: string): string {
    return jwt.sign(
      { userId, userType, phoneNumber },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // JWT Token Verification
  verifyJwtToken(token: string): { userId: string; userType: string; phoneNumber: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        userId: decoded.userId,
        userType: decoded.userType,
        phoneNumber: decoded.phoneNumber,
      };
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  // Log user login
  async logUserLogin(userId: string, userType: string, phoneNumber: string, metadata?: any): Promise<void> {
    const logData = {
      phone_number: phoneNumber,
      ip_address: metadata?.ip_address,
      user_agent: metadata?.user_agent,
      location: metadata?.location,
    };

    try {
      switch (userType) {
        case 'superadmin':
          await new this.superAdminLoginLogModel({ ...logData, superadmin_id: userId }).save();
          break;
        case 'admin':
          await new this.employeeLoginLogModel({ ...logData, employee_id: userId }).save();
          break;
        case 'technician':
          await new this.technicianLoginLogModel({ ...logData, technician_id: userId }).save();
          break;
        case 'customer':
          await new this.userLoginLogModel({ ...logData, user_id: userId }).save();
          break;
      }
      console.log(`📝 Login logged for ${userType}: ${phoneNumber}`);
    } catch (error) {
      console.error('Failed to log login:', error);
    }
  }

  // Legacy session token methods (for backward compatibility)
  generateSessionToken(userId: string): string {
    return `session_${userId}_${Date.now()}`;
  }

  parseSessionToken(sessionToken: string): { userId: string } | null {
    if (!sessionToken || !sessionToken.startsWith('session_')) {
      return null;
    }

    const parts = sessionToken.split('_');
    if (parts.length < 3) {
      return null;
    }

    return { userId: parts[1] };
  }
}
