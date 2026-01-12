import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserLoginLogDocument = UserLoginLog & Document;

@Schema({
  collection: 'users_login_logs',
  timestamps: { createdAt: 'login_time', updatedAt: false },
})
export class UserLoginLog {
  @Prop({ required: true })
  user_id: string;

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

export const UserLoginLogSchema = SchemaFactory.createForClass(UserLoginLog);
