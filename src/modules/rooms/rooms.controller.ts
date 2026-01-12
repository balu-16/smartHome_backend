import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('v1/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('house/:houseId')
  async findByHouse(@Param('houseId') houseId: string) {
    const rooms = await this.roomsService.findByHouse(houseId);
    return { success: true, data: rooms };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const room = await this.roomsService.findById(id);
    if (!room) {
      throw new HttpException({ success: false, error: 'Room not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, data: room };
  }

  @Post()
  async create(@Body() body: { house_id: string; room_name: string }) {
    if (!body.house_id || !body.room_name) {
      throw new HttpException({ success: false, error: 'house_id and room_name are required' }, HttpStatus.BAD_REQUEST);
    }
    const room = await this.roomsService.create(body);
    return { success: true, data: room };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { room_name: string }) {
    if (!body.room_name) {
      throw new HttpException({ success: false, error: 'room_name is required' }, HttpStatus.BAD_REQUEST);
    }
    const room = await this.roomsService.update(id, body);
    if (!room) {
      throw new HttpException({ success: false, error: 'Room not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, data: room };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const room = await this.roomsService.delete(id);
    if (!room) {
      throw new HttpException({ success: false, error: 'Room not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, message: 'Room deleted successfully' };
  }
}
