import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';

export type FriendDocument = Document & {
  user: Types.ObjectId;
  friends: Types.ObjectId[];
};

@Schema()
export class Friend {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop([{ type: Types.ObjectId, ref: User.name }])
  friends: Types.ObjectId[];
}

export const FriendSchema = SchemaFactory.createForClass(Friend);
