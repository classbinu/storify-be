import { IsNotEmpty, IsArray, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFriendDto {
  @IsNotEmpty()
  @IsMongoId()
  user: Types.ObjectId;

  @IsArray()
  @IsMongoId({ each: true })
  friends: Types.ObjectId[];
}
