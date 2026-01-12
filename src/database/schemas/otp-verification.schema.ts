import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpVerificationDocument = OtpVerification & Document;

@Schema({
  collection: 'otp_verifications',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class OtpVerification {
  @Prop({ required: true })
  phone_number: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true })
  expires_at: Date;

  @Prop({ default: false })
  is_verified: boolean;
}

export const OtpVerificationSchema =
  SchemaFactory.createForClass(OtpVerification);

OtpVerificationSchema.index({ phone_number: 1, otp: 1, is_verified: 1 });
