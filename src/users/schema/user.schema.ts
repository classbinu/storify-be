import * as argon2 from 'argon2';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  id: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, unique: true })
  email: string;

  @Prop({ required: false })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date = new Date();

  async validatePassword(password: string): Promise<boolean> {
    const hash = await argon2.hash(password);
    return await argon2.verify(hash, this.password);
  }

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  next();
});
