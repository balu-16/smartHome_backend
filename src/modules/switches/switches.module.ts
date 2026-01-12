import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SwitchesController } from './switches.controller';
import { SwitchesService } from './switches.service';
import { Switch, SwitchSchema } from '../../database/schemas/switch.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Switch.name, schema: SwitchSchema },
    ]),
  ],
  controllers: [SwitchesController],
  providers: [SwitchesService],
  exports: [SwitchesService],
})
export class SwitchesModule {}
