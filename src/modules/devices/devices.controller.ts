import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto, UpdateDeviceDto, AllocateDeviceDto, ShareDeviceDto } from './dto/create-device.dto';

@Controller('v1/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  async findAll() {
    const devices = await this.devicesService.findAll();
    return { success: true, data: devices };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const device = await this.devicesService.findById(id);
    if (!device) {
      throw new HttpException({ success: false, error: 'Device not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, data: device };
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    const devices = await this.devicesService.findByUser(userId);
    return { success: true, data: devices };
  }

  @Get('shared-with/:userId')
  async getSharedWithUser(@Param('userId') userId: string) {
    const devices = await this.devicesService.getSharedWithUser(userId);
    return { success: true, data: devices };
  }

  @Get('room/:roomId')
  async findByRoom(@Param('roomId') roomId: string) {
    const devices = await this.devicesService.findByRoom(roomId);
    return { success: true, data: devices };
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    const device = await this.devicesService.findByDeviceCode(code);
    if (!device) {
      throw new HttpException({ success: false, error: 'Device not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, data: device };
  }

  @Post('allocate')
  async allocateDevice(@Body() body: AllocateDeviceDto) {
    const { device_code, user_id, user_name, device_name, room_id, house_id, electronic_object } = body;
    
    if (!device_code || !user_id) {
      throw new HttpException({ success: false, error: 'Device code and user ID are required' }, HttpStatus.BAD_REQUEST);
    }

    if (!room_id || !house_id) {
      throw new HttpException({ success: false, error: 'Room ID and House ID are required' }, HttpStatus.BAD_REQUEST);
    }

    const device = await this.devicesService.findByDeviceCode(device_code);
    if (!device) {
      throw new HttpException({ success: false, error: 'Device not found' }, HttpStatus.NOT_FOUND);
    }

    if (device.allocated_to_customer_id) {
      throw new HttpException({ success: false, error: 'Device is already allocated' }, HttpStatus.BAD_REQUEST);
    }

    const allocatedAt = new Date();

    // Update the device record
    const updatedDevice = await this.devicesService.update(device._id.toString(), {
      allocated_to_customer_id: user_id,
      allocated_to_customer_name: user_name,
      allocated_at: allocatedAt,
      device_name: device_name || device.device_name,
      room_id: room_id,
      electronic_object: electronic_object,
    });

    // Create a switch record in the switches collection (this is the allocated device)
    const switchRecord = await this.devicesService.createSwitchForDevice({
      device_id: device._id.toString(),
      device_code: device.device_code,
      device_name: device_name || device.device_name,
      device_m2m_number: device.device_m2m_number,
      room_id: room_id,
      house_id: house_id,
      allocated_to_customer_id: user_id,
      allocated_to_customer_name: user_name,
      electronic_object: electronic_object,
      allocated_at: allocatedAt,
    });

    return { success: true, data: { device: updatedDevice, switch: switchRecord }, message: 'Device allocated successfully' };
  }

  @Post()
  async create(@Body() body: CreateDeviceDto) {
    const device = await this.devicesService.create(body);
    return { success: true, data: device };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateDeviceDto) {
    const device = await this.devicesService.update(id, body);
    if (!device) {
      throw new HttpException({ success: false, error: 'Device not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, data: device };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const device = await this.devicesService.unassignDevice(id);
    if (!device) {
      throw new HttpException({ success: false, error: 'Device not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, message: 'Device deleted successfully' };
  }

  @Post(':id/share')
  async shareDevice(@Param('id') id: string, @Body() body: ShareDeviceDto) {
    const { phoneNumber } = body;
    if (!phoneNumber) {
      throw new HttpException({ success: false, error: 'Phone number is required' }, HttpStatus.BAD_REQUEST);
    }

    const user = await this.devicesService.findUserByPhone(phoneNumber);
    if (!user) {
      throw new HttpException({ success: false, error: 'User with this phone number not found' }, HttpStatus.NOT_FOUND);
    }

    const alreadyShared = await this.devicesService.isDeviceSharedWith(id, user._id.toString());
    if (alreadyShared) {
      throw new HttpException({ success: false, error: 'Device is already shared with this user' }, HttpStatus.BAD_REQUEST);
    }

    await this.devicesService.shareDevice(id, user._id.toString());
    return { success: true, message: `Device shared successfully with ${user.full_name}` };
  }

  @Delete(':id/unshare/:userId')
  async unshareDevice(@Param('id') id: string, @Param('userId') userId: string) {
    const result = await this.devicesService.unshareDevice(id, userId);
    if (!result) {
      throw new HttpException({ success: false, error: 'Share record not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, message: 'Device unshared successfully' };
  }
}
