import { IsNotEmpty, IsString } from 'class-validator';

import { ApiHideProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateStoryDto {
  // @IsString()
  // @IsNotEmpty()
  // title: string;

  // @IsString()
  // @IsNotEmpty()
  // body: string;

  @IsNotEmpty()
  @ApiHideProperty()
  userId: Types.ObjectId | string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
