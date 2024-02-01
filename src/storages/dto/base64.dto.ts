import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class Base64Dto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  base64: string;
}
