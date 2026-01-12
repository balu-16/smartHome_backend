import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({
  collection: 'admins',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class Admin {
  @Prop({ required: true, unique: true })
  phone_number: string;

  @Prop({ required: true })
  full_name: string;

  @Prop()
  admin_id: string;

  @Prop()
  email: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

// Backward compatibility aliases
export type EmployeeDataDocument = AdminDocument;
export const EmployeeData = Admin;
export const EmployeeDataSchema = AdminSchema;
