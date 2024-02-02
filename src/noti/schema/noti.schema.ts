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
  service: string; // 서비스 유형 필드 추가

  @Prop({ default: 'unread' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const NotiSchema = SchemaFactory.createForClass(Noti);
