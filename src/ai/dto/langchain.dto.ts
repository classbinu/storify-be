import { IsNotEmpty, IsString } from 'class-validator';

export class LangchainDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
