import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FriendReqDocument = FriendReq & Document;

@Schema()
export class FriendReq {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['대기', '취소', '거절', '승낙'],
    default: '대기',
  })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date = new Date();
}

export const FriendReqSchema = SchemaFactory.createForClass(FriendReq);
