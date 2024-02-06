import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[^\s]*$/, {
    message: 'userId should not contain spaces',
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
