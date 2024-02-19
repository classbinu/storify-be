import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: '아이디를 3글자 이상 입력해 주세요.' })
  @MaxLength(10, { message: '아이디를 10글자 이내로 입력해 주세요.' })
  @Matches(/^[a-z0-9]*$/, {
    message: '아이디는 소문자와 숫자만 입력해 주세요.',
  })
  userId: string;

  @IsString()
  @MinLength(4, { message: '비밀번호를 4글자 이상 입력해 주세요.' })
  @IsNotEmpty()
  password: string;
}
