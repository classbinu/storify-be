import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTtsDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
