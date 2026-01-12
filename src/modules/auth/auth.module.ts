import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import {
  OtpVerification,
  OtpVerificationSchema,
} from '../../database/schemas/otp-verification.schema';
import {
  SuperAdmin,
  SuperAdminSchema,
} from '../../database/schemas/super-admin.schema';
import {
  EmployeeData,
  EmployeeDataSchema,
} from '../../database/schemas/employee-data.schema';
import {
  User,
  UserSchema,
} from '../../database/schemas/signup-user.schema';
import {
  Technician,
  TechnicianSchema,
} from '../../database/schemas/technician.schema';
import {
  UserLoginLog,
  UserLoginLogSchema,
} from '../../database/schemas/user-login-log.schema';
import {
  SuperAdminLoginLog,
  SuperAdminLoginLogSchema,
} from '../../database/schemas/superadmin-login-log.schema';
import {
  TechnicianLoginLog,
  TechnicianLoginLogSchema,
} from '../../database/schemas/technician-login-log.schema';
import {
  EmployeeLoginLog,
  EmployeeLoginLogSchema,
} from '../../database/schemas/employee-login-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OtpVerification.name, schema: OtpVerificationSchema },
      { name: SuperAdmin.name, schema: SuperAdminSchema },
      { name: EmployeeData.name, schema: EmployeeDataSchema },
      { name: User.name, schema: UserSchema },
      { name: Technician.name, schema: TechnicianSchema },
      { name: UserLoginLog.name, schema: UserLoginLogSchema },
      { name: SuperAdminLoginLog.name, schema: SuperAdminLoginLogSchema },
      { name: TechnicianLoginLog.name, schema: TechnicianLoginLogSchema },
      { name: EmployeeLoginLog.name, schema: EmployeeLoginLogSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService],
  exports: [AuthService, OtpService],
})
export class AuthModule {}
