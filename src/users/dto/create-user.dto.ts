import { IsString, IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;
  
    @IsString()
    @IsNotEmpty()
    password: string;
  
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsOptional()
    refreshToken?: string | null;
  }
  