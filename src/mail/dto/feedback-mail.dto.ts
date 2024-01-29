import { IsNotEmpty, IsString } from 'class-validator';

export class FeedbackMailDto {
  @IsString()
  @IsNotEmpty()
  feedback: string;
}
