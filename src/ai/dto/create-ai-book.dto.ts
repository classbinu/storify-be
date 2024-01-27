import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

enum ImageStyle {
  Cartoon = 'cartoon',
  Storybook = 'storybook',
  Ghibli = 'ghibli',
}

export class CreateAiBookDto {
  @IsString()
  @IsNotEmpty()
  aiStory: string;

  @IsString()
  @IsNotEmpty()
  storyId: string;

  @IsEnum(ImageStyle)
  @ApiProperty({
    description: 'cartoon, storybook, ghibli',
    example: 'cartoon',
  })
  imageStyle: string;
}
