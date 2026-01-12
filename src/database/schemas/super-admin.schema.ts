import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SuperAdminDocument = SuperAdmin & Document;

@Schema({
  collection: 'super_admins',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class SuperAdmin {
  @Prop({ required: true, unique: true })
  phone_number: string;

  @Prop({ required: true })
  full_name: string;
}

export const SuperAdminSchema = SchemaFactory.createForClass(SuperAdmin);
