import { IsNotEmpty, IsString } from 'class-validator';

import { Types } from 'mongoose';

export class BodyDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  imagePrompt: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  ttsUrl: string;
}

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  coverUrl: string;

  @IsNotEmpty()
  body: { [key: string]: BodyDto };

  @IsNotEmpty()
  storyId: string | Types.ObjectId;

  @IsNotEmpty()
  userId: string | Types.ObjectId;
}
