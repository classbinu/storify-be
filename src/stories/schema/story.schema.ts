import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoryDocument = Story & Document;

@Schema()
export class Story {
  @Prop({ required: false })
  title: string;

  @Prop({ required: false })
  body: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId: Types.ObjectId;

  @Prop({ required: false })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date = new Date();
}

export const StorySchema = SchemaFactory.createForClass(Story);
