import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]*$/, {
    message: 'userId should not contain spaces or special characters',
  })
  userId: string;

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
