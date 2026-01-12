import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OtpVerification,
  OtpVerificationSchema,
} from './schemas/otp-verification.schema';
import { SuperAdmin, SuperAdminSchema } from './schemas/super-admin.schema';
import { EmployeeData, EmployeeDataSchema } from './schemas/employee-data.schema';
import { User, UserSchema } from './schemas/signup-user.schema';
import { Device, DeviceSchema } from './schemas/device.schema';
import { GpsData, GpsDataSchema } from './schemas/gps-data.schema';
import {
  EmployeeLoginLog,
  EmployeeLoginLogSchema,
} from './schemas/employee-login-log.schema';
import { House, HouseSchema } from './schemas/house.schema';
import { Room, RoomSchema } from './schemas/room.schema';
import { Switch, SwitchSchema } from './schemas/switch.schema';
import { DeviceShared, DeviceSharedSchema } from './schemas/device-shared.schema';
import { Technician, TechnicianSchema } from './schemas/technician.schema';
import { UserLoginLog, UserLoginLogSchema } from './schemas/user-login-log.schema';
import { SuperAdminLoginLog, SuperAdminLoginLogSchema } from './schemas/superadmin-login-log.schema';
import { TechnicianLoginLog, TechnicianLoginLogSchema } from './schemas/technician-login-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OtpVerification.name, schema: OtpVerificationSchema },
      { name: SuperAdmin.name, schema: SuperAdminSchema },
      { name: EmployeeData.name, schema: EmployeeDataSchema },
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: GpsData.name, schema: GpsDataSchema },
      { name: EmployeeLoginLog.name, schema: EmployeeLoginLogSchema },
      { name: House.name, schema: HouseSchema },
      { name: Room.name, schema: RoomSchema },
      { name: Switch.name, schema: SwitchSchema },
      { name: DeviceShared.name, schema: DeviceSharedSchema },
      { name: Technician.name, schema: TechnicianSchema },
      { name: UserLoginLog.name, schema: UserLoginLogSchema },
      { name: SuperAdminLoginLog.name, schema: SuperAdminLoginLogSchema },
      { name: TechnicianLoginLog.name, schema: TechnicianLoginLogSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
