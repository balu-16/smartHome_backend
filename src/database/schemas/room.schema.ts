import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema({
  collection: 'rooms',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class Room {
  @Prop({ required: true })
  house_id: string;

  @Prop({ required: true })
  room_name: string;

  @Prop()
  room_type: string;

  @Prop()
  description: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.index({ house_id: 1 });
