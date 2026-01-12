import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { HousesService } from './houses.service';

@Controller('v1/houses')
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    const houses = await this.housesService.findByUser(userId);
    return { success: true, data: houses };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const house = await this.housesService.findById(id);
    if (!house) {
      throw new HttpException({ success: false, error: 'House not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, data: house };
  }

  @Post()
  async create(@Body() body: { user_id: string; house_name: string }) {
    if (!body.user_id || !body.house_name) {
      throw new HttpException({ success: false, error: 'user_id and house_name are required' }, HttpStatus.BAD_REQUEST);
    }
    const house = await this.housesService.create(body);
    return { success: true, data: house };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { house_name: string }) {
    if (!body.house_name) {
      throw new HttpException({ success: false, error: 'house_name is required' }, HttpStatus.BAD_REQUEST);
    }
    const house = await this.housesService.update(id, body);
    if (!house) {
      throw new HttpException({ success: false, error: 'House not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, data: house };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const house = await this.housesService.delete(id);
    if (!house) {
      throw new HttpException({ success: false, error: 'House not found' }, HttpStatus.NOT_FOUND);
    }
    return { success: true, message: 'House deleted successfully' };
  }
}
