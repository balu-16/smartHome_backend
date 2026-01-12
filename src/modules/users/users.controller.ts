import { Controller, Get, Post, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('find-by-phone')
  async findByPhone(@Body('phoneNumber') phoneNumber: string) {
    if (!phoneNumber) {
      throw new HttpException({ success: false, error: 'Phone number is required' }, HttpStatus.BAD_REQUEST);
    }

    const result = await this.usersService.findByPhone(phoneNumber);
    if (!result) {
      return { success: false, exists: false, user: null };
    }

    return {
      success: true,
      exists: true,
      userType: result.userType,
      user: {
        id: result.user._id.toString(),
        phone_number: result.user.phone_number,
        full_name: result.user.full_name,
        created_at: result.user.created_at,
      },
    };
  }

  @Get('list/super-admins')
  async getSuperAdmins() {
    const users = await this.usersService.getAllSuperAdmins();
    return { success: true, data: users };
  }

  @Get('list/employees')
  async getEmployees() {
    const users = await this.usersService.getAllEmployees();
    return { success: true, data: users };
  }

  @Get('list/customers')
  async getCustomers() {
    const users = await this.usersService.getAllCustomers();
    return { success: true, data: users };
  }

  @Get('list/technicians')
  async getTechnicians() {
    const users = await this.usersService.getAllTechnicians();
    return { success: true, data: users };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.usersService.findById(id);
    if (!result) {
      throw new HttpException({ success: false, error: 'User not found' }, HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      userType: result.userType,
      user: {
        id: result.user._id.toString(),
        phone_number: result.user.phone_number,
        full_name: result.user.full_name,
        created_at: result.user.created_at,
      },
    };
  }

  @Post('create/customer')
  async createCustomer(@Body() body: { phone_number: string; full_name: string; email?: string }) {
    const { phone_number, full_name, email } = body;
    
    if (!phone_number || !full_name) {
      throw new HttpException({ success: false, error: 'Phone number and full name are required' }, HttpStatus.BAD_REQUEST);
    }

    // Check if user already exists
    const existing = await this.usersService.findByPhone(phone_number);
    if (existing) {
      throw new HttpException({ success: false, error: 'A user with this phone number already exists' }, HttpStatus.CONFLICT);
    }

    const customer = await this.usersService.createCustomer({ phone_number, full_name, email });
    return { success: true, data: customer, message: 'Customer created successfully' };
  }

  @Post('create/admin')
  async createAdmin(@Body() body: { phone_number: string; full_name: string; email?: string; admin_id?: string }) {
    const { phone_number, full_name, email, admin_id } = body;
    
    if (!phone_number || !full_name) {
      throw new HttpException({ success: false, error: 'Phone number and full name are required' }, HttpStatus.BAD_REQUEST);
    }

    // Check if user already exists
    const existing = await this.usersService.findByPhone(phone_number);
    if (existing) {
      throw new HttpException({ success: false, error: 'A user with this phone number already exists' }, HttpStatus.CONFLICT);
    }

    const admin = await this.usersService.createAdmin({ phone_number, full_name, email, admin_id });
    return { success: true, data: admin, message: 'Admin created successfully' };
  }

  @Delete('customer/:id')
  async deleteCustomer(@Param('id') id: string) {
    const deleted = await this.usersService.deleteCustomer(id);
    if (!deleted) {
      throw new HttpException({ success: false, error: 'Customer not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, message: 'Customer deleted successfully' };
  }

  @Delete('admin/:id')
  async deleteAdmin(@Param('id') id: string) {
    const deleted = await this.usersService.deleteAdmin(id);
    if (!deleted) {
      throw new HttpException({ success: false, error: 'Admin not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, message: 'Admin deleted successfully' };
  }
}
