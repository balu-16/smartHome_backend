import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
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
}
