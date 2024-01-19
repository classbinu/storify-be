import { IsString, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { ApiHideProperty } from '@nestjs/swagger';

export class CreateStoryDto {
  // @IsString()
  // @IsNotEmpty()
  // title: string;

  // @IsString()
  // @IsNotEmpty()
  // body: string;

  @IsNotEmpty()
  @ApiHideProperty()
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  message: string;
}
