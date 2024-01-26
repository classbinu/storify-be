import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAiBookDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  storyId: string;
}
