import { IsNotEmpty, IsArray, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFriendDto {
  @IsNotEmpty()
  user: string | Types.ObjectId;

  @IsArray()
  @IsMongoId({ each: true })
  friends: Types.ObjectId[];
}
