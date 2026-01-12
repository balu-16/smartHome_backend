import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class User {
  @Prop({ required: true, unique: true })
  phone_number: string;

  @Prop({ required: true })
  full_name: string;

  @Prop()
  email: string;

  @Prop()
  user_id: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Backward compatibility aliases
export type SignupUserDocument = UserDocument;
export const SignupUser = User;
export const SignupUserSchema = UserSchema;
