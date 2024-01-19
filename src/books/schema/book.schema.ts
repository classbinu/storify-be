import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookDocument = Book & Document;

@Schema()
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({
    type: Map,
    of: {
      text: String,
      imagePrompt: [String],
      imageUrl: String,
      ttsUrl: String,
    },
  })
  body: Map<
    string,
    {
      text: string;
      imagePrompt: string[];
      imageUrl: string;
      ttsUrl: string;
    }
  >;

  // @Prop({ required: true })
  category: string;

  // @Prop({ type: [String], required: true })
  tag: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Story', required: true })
  storyId: Types.ObjectId;

  // @Prop({ required: true })
  rate: number;

  // @Prop({ required: true })
  count: number;

  // @Prop({ required: true })
  status: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
