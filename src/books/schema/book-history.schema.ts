import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookHistoryDocument = BookHistory & Document;

@Schema()
export class BookHistory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ default: 0 })
  lastPage: number;

  @Prop({ default: 0 })
  rate: number;

  @Prop({ default: 0 })
  count: number;

  @Prop({ default: Date.now })
  createdAt: Date = new Date();
}

export const BookHistorySchema = SchemaFactory.createForClass(BookHistory);
