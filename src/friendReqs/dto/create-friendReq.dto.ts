import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFriendReqDto {
  @IsOptional()
  sender?: Types.ObjectId;

  @IsNotEmpty()
  receiver: string;

  @IsEnum(['대기', '취소', '거절', '승낙'])
  status: string = '대기';
}
