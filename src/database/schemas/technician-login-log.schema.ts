import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TechnicianLoginLogDocument = TechnicianLoginLog & Document;

@Schema({
  collection: 'technician_login_logs',
  timestamps: { createdAt: 'login_time', updatedAt: false },
})
export class TechnicianLoginLog {
  @Prop({ required: true })
  technician_id: string;

  @Prop({ required: true })
  phone_number: string;

  @Prop()
  ip_address: string;

  @Prop()
  user_agent: string;

  @Prop({ type: Object })
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export const TechnicianLoginLogSchema = SchemaFactory.createForClass(TechnicianLoginLog);
