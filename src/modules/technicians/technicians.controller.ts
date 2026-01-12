import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TechniciansService } from './technicians.service';

@Controller('v1/technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  async findAll() {
    try {
      const technicians = await this.techniciansService.findAll();
      return {
        success: true,
        data: technicians,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: 'Failed to fetch technicians' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      const technician = await this.techniciansService.findById(id);
      if (!technician) {
        throw new HttpException(
          { success: false, error: 'Technician not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: technician,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, error: 'Failed to fetch technician' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @Body()
    body: {
      phone_number: string;
      full_name: string;
      email?: string;
      employee_id?: string;
      added_by: string;
    },
  ) {
    try {
      // Check if technician already exists
      const existing = await this.techniciansService.findByPhone(
        body.phone_number,
      );
      if (existing) {
        throw new HttpException(
          { success: false, error: 'Technician with this phone number already exists' },
          HttpStatus.CONFLICT,
        );
      }

      const technician = await this.techniciansService.create(body);
      return {
        success: true,
        message: 'Technician created successfully',
        data: technician,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, error: 'Failed to create technician' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      full_name?: string;
      email?: string;
      is_active?: boolean;
    },
  ) {
    try {
      const technician = await this.techniciansService.update(id, body);
      if (!technician) {
        throw new HttpException(
          { success: false, error: 'Technician not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: 'Technician updated successfully',
        data: technician,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, error: 'Failed to update technician' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const deleted = await this.techniciansService.delete(id);
      if (!deleted) {
        throw new HttpException(
          { success: false, error: 'Technician not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: 'Technician deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, error: 'Failed to delete technician' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    try {
      const technician = await this.techniciansService.toggleActive(id);
      if (!technician) {
        throw new HttpException(
          { success: false, error: 'Technician not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: `Technician ${technician.is_active ? 'activated' : 'deactivated'} successfully`,
        data: technician,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, error: 'Failed to toggle technician status' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
