import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminLoginLogDocument = AdminLoginLog & Document;

@Schema({
  collection: 'admin_login_logs',
  timestamps: false,
})
export class AdminLoginLog {
  @Prop({ required: true })
  admin_id: string;

  @Prop({ required: true })
  login_time: Date;
}

export const AdminLoginLogSchema =
  SchemaFactory.createForClass(AdminLoginLog);

AdminLoginLogSchema.index({ admin_id: 1 });

// Backward compatibility aliases
export type EmployeeLoginLogDocument = AdminLoginLogDocument;
export const EmployeeLoginLog = AdminLoginLog;
export const EmployeeLoginLogSchema = AdminLoginLogSchema;
