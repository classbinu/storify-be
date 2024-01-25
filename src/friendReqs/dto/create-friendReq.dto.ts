import { IsNotEmpty, IsEnum } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFriendReqDto {
  @IsNotEmpty()
  sender: Types.ObjectId;

  @IsNotEmpty()
  receiver: Types.ObjectId;

  @IsEnum([0, 1, 2, 3])
  status: number;
}
