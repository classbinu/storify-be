import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // @IsString()
  // @IsEmail()
  // @IsOptional()
  // email: string;

  // @IsOptional()
  // refreshToken?: string | null;
}
