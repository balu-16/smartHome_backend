import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { SwitchesService } from './switches.service';
import { CreateSwitchDto, UpdateSwitchDto } from './dto/switch.dto';

@Controller('v1/switches')
export class SwitchesController {
  constructor(private readonly switchesService: SwitchesService) {}

  @Get('device/:deviceId')
  async findByDevice(@Param('deviceId') deviceId: string) {
    const switches = await this.switchesService.findByDevice(deviceId);
    return { success: true, data: switches };
  }

  @Get('room/:roomId')
  async findByRoom(@Param('roomId') roomId: string) {
    const switches = await this.switchesService.findByRoom(roomId);
    return { success: true, data: switches };
  }

  @Get('house/:houseId')
  async findByHouse(@Param('houseId') houseId: string) {
    const switches = await this.switchesService.findByHouse(houseId);
    return { success: true, data: switches };
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    const switches = await this.switchesService.findByUser(userId);
    return { success: true, data: switches };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const switchItem = await this.switchesService.findById(id);
    if (!switchItem) {
      throw new HttpException({ success: false, error: 'Switch not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, data: switchItem };
  }

  @Post()
  async create(@Body() body: CreateSwitchDto) {
    const switchItem = await this.switchesService.create(body);
    return { success: true, data: switchItem };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateSwitchDto) {
    const switchItem = await this.switchesService.update(id, body);
    if (!switchItem) {
      throw new HttpException({ success: false, error: 'Switch not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, data: switchItem };
  }

  @Put(':id/toggle')
  async toggleSwitch(@Param('id') id: string) {
    const switchItem = await this.switchesService.toggleSwitch(id);
    if (!switchItem) {
      throw new HttpException({ success: false, error: 'Switch not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, data: switchItem };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const switchItem = await this.switchesService.delete(id);
    if (!switchItem) {
      throw new HttpException({ success: false, error: 'Switch not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, message: 'Switch deleted successfully' };
  }
}
