import { IsArray, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateFriendDto {
  @IsArray()
  @IsMongoId({ each: true })
  friends: Types.ObjectId[];
}
