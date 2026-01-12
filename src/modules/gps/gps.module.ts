import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GpsController } from './gps.controller';
import { GpsService } from './gps.service';
import { Device, DeviceSchema } from '../../database/schemas/device.schema';
import { GpsData, GpsDataSchema } from '../../database/schemas/gps-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: GpsData.name, schema: GpsDataSchema },
    ]),
  ],
  controllers: [GpsController],
  providers: [GpsService],
  exports: [GpsService],
})
export class GpsModule {}
