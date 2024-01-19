import { IsNotEmpty, IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class BodyDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @IsString({ each: true })
  imagePrompt: string[];

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

  @IsNotEmpty()
  body: { [key: string]: BodyDto };
}
