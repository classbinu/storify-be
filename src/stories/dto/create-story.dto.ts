import { IsString, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateStoryDto {
  // @IsString()
  // @IsNotEmpty()
  // title: string;

  // @IsString()
  // @IsNotEmpty()
  // body: string;

  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  storyId: string;
}
