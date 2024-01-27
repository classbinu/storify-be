import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAiBookDto {
  @IsString()
  @IsNotEmpty()
  aiStory: string;

  @IsString()
  @IsNotEmpty()
  storyId: string;
}
