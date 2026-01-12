import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SuperAdminLoginLogDocument = SuperAdminLoginLog & Document;

@Schema({
  collection: 'superadmin_login_logs',
  timestamps: { createdAt: 'login_time', updatedAt: false },
})
export class SuperAdminLoginLog {
  @Prop({ required: true })
  superadmin_id: string;

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

export const SuperAdminLoginLogSchema = SchemaFactory.createForClass(SuperAdminLoginLog);
