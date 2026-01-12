import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { Device, DeviceSchema } from '../../database/schemas/device.schema';
import { DeviceShared, DeviceSharedSchema } from '../../database/schemas/device-shared.schema';
import { SignupUser, SignupUserSchema } from '../../database/schemas/signup-user.schema';
import { Switch, SwitchSchema } from '../../database/schemas/switch.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: DeviceShared.name, schema: DeviceSharedSchema },
      { name: SignupUser.name, schema: SignupUserSchema },
      { name: Switch.name, schema: SwitchSchema },
    ]),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
