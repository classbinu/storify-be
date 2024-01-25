import { IsEnum, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateFriendReqDto {
  @IsOptional()
  sender: Types.ObjectId;

  @IsOptional()
  receiver: Types.ObjectId;

  @IsEnum([0, 1, 2, 3])
  @IsOptional()
  status: number;
}
