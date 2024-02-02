import { IsOptional, IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  introduction?: string;
}
