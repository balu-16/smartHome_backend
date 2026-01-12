import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeviceDocument = Device & Document;

@Schema({
  collection: 'devices',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class Device {
  @Prop({ required: true, unique: true })
  device_code: string;

  @Prop()
  device_m2m_number: string;

  @Prop()
  device_name: string;

  @Prop()
  allocated_to_customer_id: string;

  @Prop()
  allocated_to_customer_name: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  room_id: string;

  @Prop()
  electronic_object: string;

  @Prop({ default: false })
  switch_is_active: boolean;

  @Prop()
  device_icon: string;

  @Prop()
  qr_code: string;

  @Prop()
  allocated_at: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.index({ device_code: 1, device_m2m_number: 1 });
