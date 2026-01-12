import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GpsDataDocument = GpsData & Document;

@Schema({
  collection: 'gps_data',
  timestamps: false,
})
export class GpsData {
  @Prop({ required: true })
  device_code: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop()
  user_id: string;

  @Prop()
  accuracy: number;

  @Prop({ required: true })
  timestamp: Date;
}

export const GpsDataSchema = SchemaFactory.createForClass(GpsData);

GpsDataSchema.index({ device_code: 1, timestamp: -1 });
