import { IsString, IsNotEmpty } from 'class-validator';

export class CreateStoryDto {
  // @IsString()
  // @IsNotEmpty()
  // title: string;

  // @IsString()
  // @IsNotEmpty()
  // body: string;

  // @IsString()
  // @IsNotEmpty()
  // username: string;
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  storyId: string;
}
