import { IsNotEmpty, IsString } from 'class-validator';

export class SendTelegramDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
