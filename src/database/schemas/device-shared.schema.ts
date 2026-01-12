import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeviceSharedDocument = DeviceShared & Document;

@Schema({
  collection: 'device_shared_with',
  timestamps: false,
})
export class DeviceShared {
  @Prop({ required: true })
  device_id: string;

  @Prop({ required: true })
  shared_with_user_id: string;

  @Prop({ required: true })
  shared_at: Date;
}

export const DeviceSharedSchema = SchemaFactory.createForClass(DeviceShared);

DeviceSharedSchema.index({ device_id: 1, shared_with_user_id: 1 });
