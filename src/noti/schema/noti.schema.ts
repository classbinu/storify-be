import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotiDocument = Noti & Document;

@Schema()
export class Noti {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  receiverId: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  service: string;

  @Prop({ default: 'unread' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  readAt: Date;
}

export const NotiSchema = SchemaFactory.createForClass(Noti);

NotiSchema.index({ readAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days
