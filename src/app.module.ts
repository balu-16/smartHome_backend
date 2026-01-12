import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { GpsModule } from './modules/gps/gps.module';
import { SmsModule } from './modules/sms/sms.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';
import { HousesModule } from './modules/houses/houses.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { SwitchesModule } from './modules/switches/switches.module';
import { TechniciansModule } from './modules/technicians/technicians.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthome',
    ),
    DatabaseModule,
    AuthModule,
    GpsModule,
    SmsModule,
    HealthModule,
    UsersModule,
    DevicesModule,
    HousesModule,
    RoomsModule,
    SwitchesModule,
    TechniciansModule,
  ],
})
export class AppModule {}
