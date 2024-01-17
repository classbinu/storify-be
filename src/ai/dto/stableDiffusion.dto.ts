import { IsNotEmpty, IsString } from 'class-validator';

export class StableDiffusionDto {
  @IsString()
  @IsNotEmpty()
  prompts: string;

  @IsString()
  @IsNotEmpty()
  negativePrompts: string =
    'bad art, ugly, deformed, watermark, duplicated, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, body out of frame, blurry, bad anatomy, blurred, grainy, signature, cut off, draft';
}
