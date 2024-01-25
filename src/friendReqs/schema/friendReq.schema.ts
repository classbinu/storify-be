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
    type: Number,
    // 0: 대기 상태
    // 1: 친구 신청 취소
    // 2: 거절
    // 3: 승낙
    enum: [0, 1, 2, 3],
    default: 0,
  })
  status: number;
}

export const FriendSchema = SchemaFactory.createForClass(FriendReq);
