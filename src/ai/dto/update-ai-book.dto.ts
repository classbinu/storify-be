import { IsString } from 'class-validator';

export class UpdateAiBookDto {
  @IsString()
  imageUrl: string;
}
