import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HousesController } from './houses.controller';
import { HousesService } from './houses.service';
import { House, HouseSchema } from '../../database/schemas/house.schema';
import { Room, RoomSchema } from '../../database/schemas/room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: House.name, schema: HouseSchema },
      { name: Room.name, schema: RoomSchema },
    ]),
  ],
  controllers: [HousesController],
  providers: [HousesService],
  exports: [HousesService],
})
export class HousesModule {}
