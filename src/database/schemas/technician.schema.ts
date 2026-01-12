import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TechnicianDocument = Technician & Document;

@Schema({
  collection: 'technicians',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Technician {
  @Prop({ required: true, unique: true })
  phone_number: string;

  @Prop({ required: true })
  full_name: string;

  @Prop()
  email: string;

  @Prop()
  employee_id: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  added_by: string; // SuperAdmin ID who added this technician
}

export const TechnicianSchema = SchemaFactory.createForClass(Technician);
