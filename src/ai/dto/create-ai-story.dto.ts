import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAiStoryDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
