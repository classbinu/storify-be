import { IsString } from 'class-validator';

export class UpdateAiBookDto {
  @IsString()
  base64: string;
}
