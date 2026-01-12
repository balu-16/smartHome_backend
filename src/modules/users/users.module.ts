import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SuperAdmin, SuperAdminSchema } from '../../database/schemas/super-admin.schema';
import { EmployeeData, EmployeeDataSchema } from '../../database/schemas/employee-data.schema';
import { User, UserSchema } from '../../database/schemas/signup-user.schema';
import { Technician, TechnicianSchema } from '../../database/schemas/technician.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SuperAdmin.name, schema: SuperAdminSchema },
      { name: EmployeeData.name, schema: EmployeeDataSchema },
      { name: User.name, schema: UserSchema },
      { name: Technician.name, schema: TechnicianSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
