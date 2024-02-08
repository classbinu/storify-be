import { IsEnum, IsOptional } from 'class-validator';

export class UpdateFriendReqDto {
  @IsOptional()
  sender?: string | null;

  @IsOptional()
  receiver?: string | null;

  @IsEnum(['대기', '취소', '거절', '승낙'])
  @IsOptional()
  status?: string;
}
