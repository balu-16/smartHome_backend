import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HouseDocument = House & Document;

@Schema({
  collection: 'houses',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class House {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  house_name: string;
}

export const HouseSchema = SchemaFactory.createForClass(House);

HouseSchema.index({ user_id: 1 });
