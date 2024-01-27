import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BodyDto {
  @IsString()
  text: string;

  @IsString()
  imagePrompt: string;

  @IsString()
  imageUrl: string;

  @IsString()
  ttsUrl: string;
}

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  coverUrl: string;

  @IsOptional()
  @ApiProperty({ type: () => BodyDto })
  body: { [key: string]: BodyDto };
}
