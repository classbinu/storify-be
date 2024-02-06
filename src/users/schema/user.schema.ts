import * as argon2 from 'argon2';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: false })
  password: string;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date = new Date();

  @Prop({ required: false })
  avatar: string;

  @Prop({ required: false })
  nickname: string;

  @Prop({ required: false })
  introduction: string;

  async validatePassword(password: string): Promise<boolean> {
    return await argon2.verify(this.password, password);
  }

  @Prop()
  refreshToken: string;

  @Prop()
  socialProvider: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await argon2.hash(this.password);
  next();
});
