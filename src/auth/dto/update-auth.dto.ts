import { IsString } from 'class-validator';

export class UpdateAuthDto {
  @IsString()
  oldPassword: string;

  @IsString()
  newPassword: string;
}
