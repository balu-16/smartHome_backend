import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SwitchDocument = Switch & Document;

@Schema({
  collection: 'switches',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class Switch {
  @Prop({ required: true })
  device_id: string;

  @Prop({ required: true })
  device_code: string;

  @Prop()
  device_name: string;

  @Prop()
  device_m2m_number: string;

  @Prop({ required: true })
  room_id: string;

  @Prop({ required: true })
  house_id: string;

  @Prop({ required: true })
  allocated_to_customer_id: string;

  @Prop()
  allocated_to_customer_name: string;

  @Prop()
  electronic_object: string;

  @Prop()
  device_icon: string;

  @Prop({ default: false })
  switch_is_active: boolean;

  @Prop()
  allocated_at: Date;
}

export const SwitchSchema = SchemaFactory.createForClass(Switch);

SwitchSchema.index({ device_id: 1 });
SwitchSchema.index({ room_id: 1 });
SwitchSchema.index({ house_id: 1 });
SwitchSchema.index({ allocated_to_customer_id: 1 });
